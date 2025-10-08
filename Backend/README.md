# API Documentation

## Endpoint: `/users/register`

### Description

This endpoint is used to register a new user in the system. It validates the input data, hashes the password, and stores the user information in the database.

### Method

`POST`

### Request Body

The following fields are required in the request body:

| Field      | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `name`     | String | The full name of the user.                        |
| `username` | String | A unique username for the user.                   |
| `gender`   | String | The gender of the user.                           |
| `age`      | Number | The age of the user (must be a positive integer). |
| `email`    | String | A valid email address for the user.               |
| `password` | String | A password with a minimum length of 5 characters. |

### Validation Rules

- `name`: Must not be empty.
- `username`: Must be at least 3 characters long and unique.
- `gender`: Must not be empty.
- `age`: Must be a positive integer.
- `email`: Must be a valid email address.
- `password`: Must be at least 5 characters long.

### Response

#### Success Response

- **Status Code:** `201 Created`
- **Body:**
  ```json
  {
    "message": "User registered successfully",
    "userId": "<generated_user_id>"
  }
  ```

### Error Responses

- **Status Code:** `400 Bad Request`
- **Reason** `Validation errors in the input data.`
- **Body:**

  ```json
  {
  "error": "Validation failed",
  "details": [
    "Name is required",
    "Username must be at least 3 characters long",
    ...
  ]
  }

  ```

- **Status Code:** `500 internal server error`
- **Reason** `Server error during user registration.`
- **Body:**
  ```json
  {
    "error": "An error occurred while registering the user"
  }
  ```

### Example Request

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "gender": "Male",
  "age": 25,
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

### Example Response

```json
{
  "message": "User registered successfully",
  "userId": "12345"
}
```



## Endpoint: `/users/login`

### Description

This endpoint is used to authenticate a user and provide a JWT token for accessing protected resources.


### Method

`POST`

### Request Body

The following fields are required in the request body:

| Field      | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `email`    | String | The email address for the user.                   |
| `password` | String | 	The password of the user.                       |

### Validation Rules
- `email`: Must be a valid email address.
- `password`: Must not be empty.

### Response

#### Success Response

- **Status Code:** `200 ok`
- **Body:**
```json
  {
    "token": "<jwt_token>",
  "user": {
    "id": "<user_id>",
    "name": "John Doe",
    "username": "johndoe",
    "gender": "Male",
    "age": 25,
    "email": "johndoe@example.com"
  }
 } 
```

### Error Responses

- **Status Code:** `400 Bad Request`
- **Reason** `Validation errors in the input data.`
- **Body:**

```json
 {
  "error": "Validation failed",
  "details": [
    "Email is required",
    "Password is required"
  ]
}

```

- **Status Code:** `401 Unauthorized`
- **Reason** `Invalid email or password.`
- **Body:**
```json
  {
  "message": "Invalid email or password"
}
  ```
- **Status Code:** `500 Internal Server Error`
- **Reason** `Server error during user login.`
- **Body:**
```json
  {
  "error": "An error occurred while logging in"
}
  ```

### Example Request

```json
{
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

### Example Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "12345",
    "name": "John Doe",
    "username": "johndoe",
    "gender": "Male",
    "age": 25,
    "email": "johndoe@example.com"
  }
}
```



## Endpoint: `/users/logout`

### Description

This endpoint is used to log out the authenticated user by blacklisting their token.


### Method

`GET`

### Headers
Headers
Header	Type	Description
Authorization	String	Bearer token for authentication

The following fields are required in the request body:

| Header         | Type    | Description                       |
| ----------     | ------  | ----------------------------------|
| `Authorization`| String  | Bearer token for authentication   |


### Response

#### Success Response

- **Status Code:** `200 ok`
- **Body:**
```json
  
 {
  "message": "Logged Out"
}
```

### Error Responses

- **Status Code:** `401 Unauthorized`
- **Reason** `Missing or invalid token.`
- **Body:**

```json
{
  "message": "Unauthorized"
}

```

- **Status Code:** `500 Internal Server Error`
- **Reason** `Server error during logout.`
- **Body:**
```json
{
  "error": "An error occurred while logging out"
}
  ```


## Endpoint: `/users/profile`

### Description

This endpoint is used to retrieve the profile information of the authenticated user.


### Method

`GET`

### Headers
Headers
Header	Type	Description
Authorization	String	Bearer token for authentication

The following fields are required in the request body:

| Header         | Type    | Description                       |
| ----------     | ------  | ----------------------------------|
| `Authorization`| String  | Bearer token for authentication   |


### Response

#### Success Response

- **Status Code:** `200 ok`
- **Body:**
```json
{
  "id": "<user_id>",
  "name": "John Doe",
  "username": "johndoe",
  "gender": "Male",
  "age": 25,
  "email": "johndoe@example.com"
}
```

### Error Responses

- **Status Code:** `401 Unauthorized`
- **Reason** `Missing or invalid token.`
- **Body:**

```json
{
  "message": "Unauthorized"
}

```