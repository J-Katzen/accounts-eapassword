Package.describe({
    name: "jkatzen:accounts-eapassword",
    summary: "Lets a user add another password to their account for external
    management by a differnet person.",
    version: "0.5",
    git: 'https://github.com/J-Katzen/accounts-EAPassword'
})

Package.on_use(function(api) {
    api.use('npm-bcrypt@=0.7.7', 'server');
    api.use('accounts-base', ['client', 'server']);
    api.use('sha', ['client', 'server']);
    api.use('email', ['server']);
    api.use('random', ['server']);
    api.use('check');
    api.use('underscore');
    api.use('ddp', ['client', 'server']);

    api.addFiles('EAPassword_server.js', 'server');
    api.addFiles('EAPassword_client.js', 'client');
});
