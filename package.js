Package.describe({
    name: "jkatzen:accounts-eapassword",
    summary: "Lets a user add another password to their account for external by a differnet person.",
    version: "0.5.0",
    git: 'https://github.com/J-Katzen/accounts-eapassword'
})

Package.on_use(function(api) {
    api.use('npm-bcrypt@=0.7.7', 'server');
    api.use('accounts-base@=1.1.3', ['client', 'server']);
    api.use('sha@=1.0.2', ['client', 'server']);
    api.use('email@=1.0.5', ['server']);
    api.use('random@=1.0.2', ['server']);
    api.use('check@=1.0.3');
    api.use('underscore@=1.0.2');
    api.use('ddp@=1.0.13', ['client', 'server']);

    api.addFiles('EAPassword_server.js', 'server');
    api.addFiles('EAPassword_client.js', 'client');
});
