# accounts-eapassword
This package supports user accounts that have executive assistants that can login and manage their account.

## Client

##### Accounts.createEALogin(options, [callback])
- options {EAEmail: *String*, EAPassword: *String*} - the options are used to create the EA's login credentials for the the logged in user account.

In order to create an EALogin for an account, the user must be logged in.  Creates the EALogin with the credentials specified in the options.

##### Accounts.changeEAPassword(oldPassword, newPassword, [callback])
- oldPassword *String* - the current EA password
- newPassword *String* - a new EA password

Replaces the EA password with a new password.  oldPassword must be the existing EA password in order for this function to be successful.

##### Meteor.loginWithEAPassword(user, EAEmail, password, [callback])
- user *String* - the username or email address of the account that the EA is trying to log in as.
- EAEmail *String* - the EA's email address specified for the user account they specified
- password *String* - the EA's password

Lets an EA login to a user account they have been granted access to.

## Server

##### Accounts.createEALogin(userId, options)
- userId *String* - the userId of the user that you want to create an EALogin for
- options {EAEmail: *String*, EAPassword: *String*} - the credentials for the EA login for the user

Create an EALogin from the server side.  Needs to know which user it is creating a login for.

##### Accounts.setEAPassword(userId, newPassword)
- userId *String* - the id of the user that you want to set the EAPassword for
- newPassword *String* - the new password that will be used for the EA of this user's account

Sets the password for the corresponding user for the userId specified.
