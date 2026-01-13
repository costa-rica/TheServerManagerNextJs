# Tiered Permissions

We want to implement a tiered permission system for the API. The permissions will be to have admin users which can do anything, and standard (i.e. isAdmin=false) users which can only do certain things.

There are two limitations we aim to implement:

1. Non-admin users willl be restricted to which servers they can access.
2. Non-admin users will be restricted to which pages in the NextJS frontend they can access.

## Implementation

### Backend / Database

The users collection will have an `isAdmin` boolean field, and a `accessServersArray` array field, and a `accessPagesArray` array field. The accessServersArray will contain the machine names (using the machineName field in the machines collection) of the servers the user can access, and the accessPagesArray will contain the pages the user can access.

### Backend / API

#### Login

On login the API will send the user's accessServersArray and accessPagesArray to the frontend.

#### GET /machines

The API GET /machines will return all machines if the user is an admin, and only the machines in the accessServersArray if the user is not an admin.

### Frontend

When a user logs in the frontend will receive the user's accessServersArray and accessPagesArray from the API and store them in the userSlice. The userSlice will need to be modified to store these arrays.

The AppSidebar will need to be modified to only show the pages in the accessPagesArray.

If a user types the url of a page they are not allowed to access, they will be redirected to the login page.
