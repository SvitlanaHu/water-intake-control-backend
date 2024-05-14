/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email for the user, needs to be unique.
 *         password:
 *           type: string
 *           format: password
 *           description: User's password.
 * 
 *     UpdateUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: New email for the user, optional.
 *         password:
 *           type: string
 *           format: password
 *           description: New password for the user, optional.
 *         subscription:
 *           type: string
 *           description: New subscription level for the user, optional.
 *         timezone:
 *           type: string
 *           description: New timezone for the user, optional.
 * 
 *     WaterRecord:
 *       type: object
 *       required:
 *         - volume
 *         - date
 *       properties:
 *         volume:
 *           type: number
 *           description: Volume of water consumed in milliliters.
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the water consumption record.
 * 
 *     WaterRecordUpdate:
 *       type: object
 *       properties:
 *         volume:
 *           type: number
 *           description: Updated volume of water consumed in milliliters.
 *         date:
 *           type: string
 *           format: date
 *           description: Updated date of the water consumption record.
 * 
 * paths:
 *   /api/users/register:
 *     post:
 *       summary: Register a new user
 *       tags: [Users]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegistration'
 *       responses:
 *         201:
 *           description: User registered successfully
 *         400:
 *           description: Bad request
 * 
 *   /api/users/login:
 *     post:
 *       summary: Log in a user
 *       tags: [Users]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegistration'
 *       responses:
 *         200:
 *           description: Login successful
 *         401:
 *           description: Unauthorized
 * 
 *   /api/users/logout:
 *     post:
 *       summary: Log out the current user
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         204:
 *           description: No content, user logged out successfully
 *         401:
 *           description: Unauthorized
 * 
 *   /api/users/current:
 *     get:
 *       summary: Get the current logged-in user's details
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: User details retrieved successfully
 *         401:
 *           description: Unauthorized
 * 
 *   /api/users/update/{id}:
 *     patch:
 *       summary: Update user details
 *       tags: [Users]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUser'
 *       responses:
 *         200:
 *           description: User updated successfully
 *         404:
 *           description: User not found
 *         400:
 *           description: Bad request
 * 
 *   /api/users/subscription:
 *     patch:
 *       summary: Update subscription level
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 subscription:
 *                   type: string
 *                   enum: ['starter', 'pro', 'business']
 *                   description: New subscription level
 *       responses:
 *         200:
 *           description: Subscription updated successfully
 *         401:
 *           description: Unauthorized
 *         400:
 *           description: Bad request
 * 
 *   /api/users/avatars:
 *     patch:
 *       summary: Update user's avatar
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: string
 *                   format: binary
 *                   description: New avatar image to upload
 *       responses:
 *         200:
 *           description: Avatar updated successfully
 *         400:
 *           description: No file uploaded or bad request
 *         401:
 *           description: Unauthorized
 * 
 *   /api/users/verify/{verificationToken}:
 *     get:
 *       summary: Verify user email
 *       tags: [Users]
 *       parameters:
 *         - in: path
 *           name: verificationToken
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Email verified successfully
 *         404:
 *           description: User not found or already verified
 * 
 *   /api/users/verify/resend:
 *     post:
 *       summary: Resend verification email
 *       tags: [Users]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email to resend the verification link
 *       responses:
 *         200:
 *           description: Verification email sent successfully
 *         404:
 *           description: User not found or already verified
 *         400:
 *           description: Bad request
 * 
 *   /api/water:
 *     post:
 *       summary: Create a new water consumption record
 *       tags: [Water]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaterRecord'
 *       responses:
 *         201:
 *           description: Water record created successfully
 *         400:
 *           description: Bad request
 * 
 *   /api/water/{id}:
 *     put:
 *       summary: Update an existing water consumption record
 *       tags: [Water]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             description: Water record ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaterRecordUpdate'
 *       responses:
 *         200:
 *           description: Water record updated successfully
 *         404:
 *           description: Water record not found
 *         400:
 *           description: Bad request
 *     delete:
 *       summary: Delete a water consumption record
 *       tags: [Water]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             description: Water record ID
 *       responses:
 *         200:
 *           description: Water record deleted successfully
 *         404:
 *           description: Water record not found
 * 
 *   /api/water/daily/{date}:
 *     get:
 *       summary: Get daily water consumption data
 *       tags: [Water]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: date
 *           required: true
 *           schema:
 *             type: string
 *             format: date
 *             description: The date to retrieve water records for, in YYYY-MM-DD format.
 *       responses:
 *         200:
 *           description: Daily water data retrieved successfully
 *         404:
 *           description: No records found
 * 
 *   /api/water/monthly/{year}/{month}:
 *     get:
 *       summary: Get monthly water consumption data
 *       tags: [Water]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: year
 *           required: true
 *           schema:
 *             type: integer
 *             description: The year to retrieve water records for.
 *         - in: path
 *           name: month
 *           required: true
 *           schema:
 *             type: integer
 *             description: The month to retrieve water records for, where 1 is January and 12 is December.
 *       responses:
 *         200:
 *           description: Monthly water data retrieved successfully
 *         404:
 *           description: No records found
 *
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */
