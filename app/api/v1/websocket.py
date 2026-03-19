from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.core.websocket import manager
from app.database import get_db
from app.models.user import User, UserRole

router = APIRouter()


async def get_user_from_token(token: str, db: AsyncSession) -> User | None:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None

        user_id = payload.get("sub")
        if user_id is None:
            return None

        result = await db.execute(select(User).where(User.id == int(user_id), User.is_active.is_(True)))
        return result.scalar_one_or_none()
    except Exception:
        return None


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> None:
    if not token:
        await websocket.close(code=4001, reason="Authentication required for WebSocket")
        return

    user = await get_user_from_token(token, db)
    if user is None or user.role not in (UserRole.PREMIUM, UserRole.ADMIN):
        await websocket.close(code=4003, reason="Premium subscription required")
        return

    await manager.connect(websocket, user.id)

    try:
        await manager.send_connection_message(
            websocket,
            {
                "type": "connection",
                "message": "Connected successfully",
                "user_id": user.id,
            },
        )

        while True:
            raw_data = await websocket.receive_text()
            try:
                message = json.loads(raw_data)
            except json.JSONDecodeError:
                await manager.send_connection_message(
                    websocket,
                    {
                        "type": "error",
                        "message": "Invalid JSON",
                    },
                )
                continue

            await handle_websocket_message(websocket, user.id, message, db)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("User {} disconnected", user.id)
    except Exception as exc:
        logger.error("WebSocket error for user {}: {}", user.id, str(exc))
        manager.disconnect(websocket)


async def handle_websocket_message(
    websocket: WebSocket,
    user_id: int,
    message: dict[str, object],
    db: AsyncSession,
) -> None:
    del db

    message_type = message.get("type")

    if message_type == "join_room":
        room = str(message.get("room") or "").strip()
        if room:
            await manager.join_room(websocket, room)
            await manager.send_connection_message(
                websocket,
                {
                    "type": "room_joined",
                    "room": room,
                },
            )
        return

    if message_type == "leave_room":
        room = str(message.get("room") or "").strip()
        if room:
            await manager.leave_room(websocket, room)
            await manager.send_connection_message(
                websocket,
                {
                    "type": "room_left",
                    "room": room,
                },
            )
        return

    if message_type == "subscribe_symbol":
        symbol = str(message.get("symbol") or "").strip().upper()
        if symbol:
            await manager.join_room(websocket, f"symbol_{symbol}")
            await manager.send_connection_message(
                websocket,
                {
                    "type": "subscribed",
                    "symbol": symbol,
                },
            )
        return

    if message_type == "ping":
        await manager.send_connection_message(
            websocket,
            {
                "type": "pong",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "user_id": user_id,
            },
        )
        return

    await manager.send_connection_message(
        websocket,
        {
            "type": "error",
            "message": f"Unknown message type: {message_type}",
        },
    )
