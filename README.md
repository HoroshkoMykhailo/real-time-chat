# TeamLink

## Project Overview

This project is a real-time chat application that enables users to exchange messages. The chat is built on a client-server architecture using WebSocket for bidirectional communication, ensuring rapid data transmission without needing to reload the page.

The main goal of this project is to create a platform for messaging, suitable for both personal and business use.

## Key Features

- **Instant Messaging:** Users can send and receive messages in real-time without delays.
- **Multi-User Support:** The chat supports multiple users simultaneously.
- **Group and Private Chats:** Ability to create group chats or have private conversations between two users.
- **Media File Support:** Send images, videos, audio, and documents.
- **Message History:** Store message history on the server, allowing users to view past conversations at any time.
- **User Authentication and Authorization:** Secure login via email and password.

## Technical Requirements

- **Frontend:** React.js with state management libraries (Redux) and Socket.IO for server communication.
- **Backend:** Node.js with Fastify to handle requests and Socket.IO for WebSocket connections.
- **Database:** MongoDB to store user information, message history, and other data.
- **Hosting:** The project can be deployed on any platform that supports Node.js.

## Architecture

1. **Client Side (Frontend):**
   - Built with React.js integrated with Socket.IO to connect to the server.
   - Displays the user interface, including the user list, message list, input form for new messages, and other UI elements.
   - State management using Redux to support single-page applications (SPA).

2. **Server Side (Backend):**
   - Server developed using Node.js with Fastify for handling HTTP requests.
   - Socket.IO for managing real-time connections with clients.
   - MongoDB is used to store user information and message history.

3. **Database:**
   - MongoDB: A NoSQL database that efficiently stores and handles large amounts of data, such as chat messages, media files, and user data.

## Local Setup

To get the source code of the application, clone the repository using the following command `git clone <repository_link>`

Then:

1. Use the Node.js version in [`.nvmrc`](./.nvmrc) (for example `nvm use`).

2. Install dependencies: `npm install`.

3. Build shared: `npm run build:shared`

4. Run database. You can run it by installing mongoDb on your computer.

5. Create Google Cloud API key or Application Default Credentials and store them locally (see Google Cloud Speech / Vertex docs). For media uploads in production, create a **Cloud Storage** bucket, set `GOOGLE_CLOUD_STORAGE_BUCKET` in `apps/backend/.env`, and grant the app’s service account permission to write objects. Objects are stored with a public `https://storage.googleapis.com/...` URL in the database, so the bucket (or objects) should allow public read for anonymous clients, unless you later add signed URLs or a download proxy.

6. Create and fill all .env files. These files are:

- apps/frontend/.env
- apps/backend/.env

You should use .env.example files as a reference.

7. Run backend: `npm run start:dev -w apps/backend`

8. Run frontend: `npm run start:dev -w apps/frontend`
