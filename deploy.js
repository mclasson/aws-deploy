var AWS = require('aws-sdk'),
	async = require('async');
AWS.config.loadFromPath('./config.js');
var environmentname = "Reedlr-env",
	applicationname = "Reedlr",
	exists = false;

var elasticbeanstalk = new AWS.ElasticBeanstalk();
var rds = new AWS.RDS();
rds.createDBInstance({
	DBName: 'Reedlr',
	DBInstanceIdentifier: 'reedlr',
	AllocatedStorage: 5,
	DBInstanceClass: 'db.t1.micro',
	Engine: 'MySql',
	MasterUsername: 'ebroot',
	MasterUserPassword: 'Peppermint2012',
	DBSecurityGroups: ['default'],
	AvailabilityZone: 'eu-west-1a',
	DBParameterGroupName: 'default.mysql5.5'

}, function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log(data);
	}
});


return;
async.series([

function(callback) {
	elasticbeanstalk.describeApplications({}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var apps = data.Applications;

			apps.forEach(function(app) {
				if (applicationname === app.ApplicationName) {
					console.log("Deleting ", app);
					elasticbeanstalk.deleteApplication({
						ApplicationName: app.ApplicationName,
						TerminateEnvByForce: true
					}, function(err, data) {
						if (err) {
							console.log(err);
						} else {
							console.log(data);

						}
					});
				}
			});

		}
		callback();
	});
},

function(callback) {
	var check = function() {
		console.log('checking environment ' + environmentname);
		elasticbeanstalk.describeEnvironments({
			EnvironmentNames: [environmentname]
		}, function(err, data) {
			if (data !== null && data.Environments.length > 0) {
				if (data.Environments[0].Status !== 'Terminated') {
					console.log('Environment ' + environmentname + ' still there....');
					setTimeout(check, 1000);
				} else {
					console.log(data);
					callback();
				}
			}


		});
	};
	setTimeout(check, 1000);
},

function(callback) {
	elasticbeanstalk.createApplication({
		ApplicationName: "Reedlr",
		Description: "Google reader"
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log(data);
			callback();
		}

	});


},

function(callback) {
	elasticbeanstalk.createEnvironment({
		ApplicationName: "Reedlr",
		EnvironmentName: "Reedlr-env",
		CNAMEPrefix: "reedlr",
		SolutionStackName: "64bit Amazon Linux running Node.js",
		OptionSettings: [{
			Namespace: "aws:autoscaling:launchconfiguration",
			OptionName: "SecurityGroups",
			Value: "default"
		}, {
			Namespace: "aws:autoscaling:launchconfiguration",
			OptionName: "EC2KeyName",
			Value: "La"
		}, {
			Namespace: "aws:autoscaling:launchconfiguration",
			OptionName: "IamInstanceProfile",
			Value: "aws-elasticbeanstalk-ec2-role"
		}]

	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log(data);
		}
		callback();
	});

}, function(callback) {
	var rds = new AWS.RDS();
	rds.createDBInstance({
		DBName: 'Reedlr',
		DBInstanceIdentifier: 'reedlr',
		AllocatedStorage: 5,
		DBInstanceClass: 'db.t1.micro',
		Engine: 'MySql',
		MasterUsername: 'ebroot',
		MasterUserPassword: 'Peppermint2012',
		DBSecurityGroups: ['default'],
		AvailabilityZone: 'eu-west-1a',
		DBParameterGroupName: 'default.mysql5.5'

	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log(data);
		}
		callback();
	});

}]);