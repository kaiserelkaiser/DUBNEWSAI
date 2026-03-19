def test_register_and_login_flow(client):
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "analyst@dubnewsai.com",
            "full_name": "Market Analyst",
            "password": "supersecure123",
        },
    )
    assert register_response.status_code == 201
    register_payload = register_response.json()
    assert register_payload["email"] == "analyst@dubnewsai.com"
    assert register_payload["role"] == "user"
    assert register_payload["is_verified"] is False

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "analyst@dubnewsai.com", "password": "supersecure123"},
    )
    assert login_response.status_code == 200
    payload = login_response.json()
    assert payload["token_type"] == "bearer"
    assert payload["access_token"]
    assert payload["refresh_token"]

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {payload['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "analyst@dubnewsai.com"


def test_refresh_token_returns_new_token_pair(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh@dubnewsai.com",
            "full_name": "Refresh User",
            "password": "supersecure123",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "refresh@dubnewsai.com", "password": "supersecure123"},
    )
    refresh_token = login_response.json()["refresh_token"]

    refresh_response = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert refresh_response.status_code == 200
    payload = refresh_response.json()
    assert payload["access_token"]
    assert payload["refresh_token"]


def test_me_requires_valid_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_register_validates_email(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "full_name": "Bad Email",
            "password": "supersecure123",
        },
    )
    assert response.status_code == 422
