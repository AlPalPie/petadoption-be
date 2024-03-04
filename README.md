# Hosted
```
https://amazinganimaladoptionagency-api.onrender.com
```


# Pet Adoption Website Using the MERN Stack


This is the backend API for a mock pet adoption website. The accompanying frontend static website code is here:
```
https://github.com/AlPalPie/petadoption-fe
```

This is a personal project whose purpose is to sharpen my skills in full-stack development.

My wife and I live in a community where several stray cats have made a home amid the landscaping, mooching off many of the residents for sustenance and all-around being semi-affectionate bundles of joy. 
We love to take daily walks to visit these cats and take care of them. One of them even brought us a tiny bird to our doorstep! (the bird managed to escape safely)

I built this app to showcase those lovely cats! But also to mimic a pet adoption website and showcase the following features:

- Full Stack app using the MERN stack
- Complete RESTful backend web API and database using ExpressJS, Mongoose, MongoDB - hosted on AWS EC2
- Frontend API requests and data caching with RTK Query
- User authentication and authorization using JSON Web Tokens (JWT)
- Frontend global state management using Redux and React
- Support for uploading image files (JPEG/PNG) through multipart form data using the multer middleware package
- Cloud object storage using Amazon AWS S3

Users can perform the following actions:

- All users can view profiles and pictures of animals added by other users.
- Users must create an account and login in order to be able to add, update, or delete animals or images.
  - Users can create an account with one of 3 roles, in order of increasing privileges - Customer, Employee, Admin.
  - For demonstration purposes, all 3 roles are available to anyone.
- Users can favorite animals and view a list of their favorites on their account dashboard



# Usage


### To install package dependencies:
```
npm install
```

### The current code for this web API is setup for actual deployment, hosted on a AWS EC2 instance

The frontend static site that uses this web API is below:
```
https://amazinganimaladoptionagency.onrender.com
```




To run the app:
```
npm start
```


### To modify the code for development, search the code for "DEPLOY" and modify as follows:

#### 1. In config/allowedOrigins.js

  The allowedOrigins variable contains the domains that are allowed to access responses from this server.
  If you are using your localhost as the frontend domain for dev purposes you should include that domain, such as (assuming your frontend is using port 3000):

```
'http://localhost:3000'
```

#### 2. In config/corsOptions.js

   For dev purposes you may want to use an app like Postman to send requests to this backend w/o needing to develop a frontend first.
   In this case you will need to modify the if condition to add back in the "|| !origin" which lets CORS know that requests coming from something w/o a domain URL are allowed:

```
if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
```

#### 3. Environment variables

   Last thing to modify are the environment variables.
   You'll notice the .env folder in my .gitignore, this is so sensitive environment info isn't available publicly through this GitHub repo.
   In order to get things working you'll need to create a ".env" file and define the following variables (substitute the text in <> with your parameters):

```
NODE_ENV=development

DATABASE_URI=<the access key to your database, provided when setting up your database>

ACCESS_TOKEN_SECRET=<key used for JWT access tokens>

REFRESH_TOKEN_SECRET=<key used for JWT refresh tokens>

AWS_BUCKET_NAME=<S3 bucket name : I used AWS S3 for cloud object storage, you can use your own method for image storage>

AWS_BUCKET_REGION=<S3 bucket region>

AWS_ACCESS_KEY_ID=<S3 bucket access key>

AWS_SECRET_ACCESS_KEY=<S3 bucket secret key>
```
You can use something like this to generate the JWT token keys (using NodeJS):
```
require('crypto').randomBytes(64).toString('hex')
```

#### 4. To run in development mode

  The code should already be configured for development mode due to the .env settings so you can just run:

```
npm start
```


