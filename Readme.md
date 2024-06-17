
# YouTube Backend

This repository contains the backend code for a YouTube-like application, built using Node.js, Express.js, and MongoDB. The application provides a RESTful API for managing users, videos, comments, and other related data.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and authorization with JWT
- CRUD operations for users, videos, and comments
- Video upload 
- Likes and dislikes for videos
- User subscriptions 
- Robust error handling and validation


## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: JSON Web Tokens for authentication
- **Multer**: Middleware for handling multipart/form-data requests
- **Cloudinary**: Cloud storage for video uploads


## Installation

### Prerequisites

- Node.js (v14 or later)
- MongoDB


### Steps

1. Clone the repository:
    ```sh
    git clone https://github.com/gagankumar007/youtube-backend.git
    cd youtube-backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables (see [Configuration](#configuration)).

4. Start the MongoDB server if not using Docker:
    ```sh
    mongod
    ```

5. Start the development server:
    ```sh
    npm run dev
    ```

## Configuration

Create a `.env` file in the root directory with the following environment variables:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/youtube_backend
JWT_SECRET=your_jwt_secret
```

## Usage

### Running the Server

```sh
npm start
```

The server will start on `http://localhost:8000`.


## API Endpoints

### Auth

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user

### Users

- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/:id`: Update user by ID
- `DELETE /api/users/:id`: Delete user by ID

### Videos

- `POST /api/videos`: Upload a new video
- `GET /api/videos/:id`: Get video by ID
- `PUT /api/videos/:id`: Update video by ID
- `DELETE /api/videos/:id`: Delete video by ID

### Comments

- `POST /api/videos/:videoId/comments`: Add a comment to a video
- `GET /api/videos/:videoId/comments`: Get all comments for a video
- `DELETE /api/comments/:id`: Delete a comment by ID

### Likes

- `POST /api/videos/:videoId/like`: Like a video
- `POST /api/videos/:videoId/dislike`: Dislike a video

### Subscriptions

- `POST /api/users/:id/subscribe`: Subscribe to a user
- `POST /api/users/:id/unsubscribe`: Unsubscribe from a user


## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.
