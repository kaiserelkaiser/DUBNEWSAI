from __future__ import annotations

from collections.abc import Iterable

from fastapi import WebSocket
from loguru import logger

from app.core.metrics import active_connections


class ConnectionManager:
    """Manage WebSocket connections and room subscriptions."""

    def __init__(self) -> None:
        self.active_connections: dict[int, set[WebSocket]] = {}
        self.rooms: dict[str, set[WebSocket]] = {}
        self.connection_users: dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, user_id: int) -> None:
        await websocket.accept()

        user_connections = self.active_connections.setdefault(user_id, set())
        user_connections.add(websocket)
        self.connection_users[websocket] = user_id
        active_connections.set(self.get_connection_count())

        logger.info("User {} connected. Total connections: {}", user_id, self.get_connection_count())

    async def send_connection_message(self, websocket: WebSocket, message: dict[str, object]) -> None:
        try:
            await websocket.send_json(message)
        except Exception as exc:
            logger.error("Error sending connection message: {}", str(exc))
            self.disconnect(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        user_id = self.connection_users.pop(websocket, None)

        if user_id is not None and user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

        empty_rooms: list[str] = []
        for room, room_connections in list(self.rooms.items()):
            room_connections.discard(websocket)
            if not room_connections:
                empty_rooms.append(room)

        for room in empty_rooms:
            del self.rooms[room]

        active_connections.set(self.get_connection_count())

        logger.info("User {} disconnected. Total connections: {}", user_id, self.get_connection_count())

    async def send_personal_message(self, message: dict[str, object], user_id: int) -> None:
        connections = list(self.active_connections.get(user_id, set()))
        disconnected: set[WebSocket] = set()

        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as exc:
                logger.error("Error sending to user {}: {}", user_id, str(exc))
                disconnected.add(connection)

        self._cleanup_disconnected(disconnected)

    async def broadcast(self, message: dict[str, object], exclude_user: int | None = None) -> None:
        disconnected: set[WebSocket] = set()

        for user_id, connections in list(self.active_connections.items()):
            if exclude_user is not None and user_id == exclude_user:
                continue

            for connection in list(connections):
                try:
                    await connection.send_json(message)
                except Exception as exc:
                    logger.error("Error broadcasting to user {}: {}", user_id, str(exc))
                    disconnected.add(connection)

        self._cleanup_disconnected(disconnected)

    async def join_room(self, websocket: WebSocket, room: str) -> None:
        self.rooms.setdefault(room, set()).add(websocket)
        logger.info("Connection joined room {}", room)

    async def leave_room(self, websocket: WebSocket, room: str) -> None:
        if room not in self.rooms:
            return

        self.rooms[room].discard(websocket)
        if not self.rooms[room]:
            del self.rooms[room]

    async def broadcast_to_room(self, message: dict[str, object], room: str) -> None:
        connections = list(self.rooms.get(room, set()))
        disconnected: set[WebSocket] = set()

        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as exc:
                logger.error("Error broadcasting to room {}: {}", room, str(exc))
                disconnected.add(connection)

        self._cleanup_disconnected(disconnected)

    def get_connection_count(self) -> int:
        return sum(len(connections) for connections in self.active_connections.values())

    def get_user_count(self) -> int:
        return len(self.active_connections)

    def is_user_connected(self, user_id: int) -> bool:
        return bool(self.active_connections.get(user_id))

    def _cleanup_disconnected(self, disconnected: Iterable[WebSocket]) -> None:
        for connection in disconnected:
            self.disconnect(connection)


manager = ConnectionManager()
