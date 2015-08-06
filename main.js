var express = require('express'),
    app = express(),
    http = require('http'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    path = require('path'), // allows us to deal with file structures
    morgan = require('morgan'), // This keeps the server logs
    bodyParser = require('body-parser'), // Breakdown a POST request by request.body
    router = express.Router(), // Allows us to do server side routing
    port = process.env.PORT || 3000; // process.env are environmental variables

// Connect the DB
mongoose.connect('mongodb://localhost/bikes_app');

// Create the model for bike
var bike = mongoose.model('bike', {
    name:String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

// Set up middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));


// When someone comes to our root directory, show them this response
router.get('/', function(request, response, next){
    response.send('Hello world');
});

// INDEX
router.get('/bikes', function(request, response, next){
    bike.find(function(error, bikes) {
        if (error) return response.send(error);
        response.render('index', {title: 'bikes', bikes: bikes});
    });
});

// NEW
router.get('/bikes/new', function(request, response, next){
    response.render('new', {title: 'New bike'});
});

// SHOW
router.get('/bikes/:id', function(request, response, next){
    bike.findOne({_id: request.params.id}, function(error, bike) {
        if (error) return response.send(error);
        response.render('edit', {title: bike.name, bike: bike});
    });
});

// CREATE
router.post('/bikes', function(request, response,next){
    var bike = new bike();
    bike.name = request.body.name;

    bike.save(function(error){
        if(error) return response.send(error);
        response.redirect('/bikes');
    });
});

// EDIT
router.get('/bikes/:id/edit', function(request, response, next){
    bike.findOne({_id: request.params.id}, function(error, bike) {
        if (error) return response.send(error);
        response.render('show', {
            title: 'Edit bike',
            bike: bike
        });
    });
});

// UPDATE
router.put('/bikes/:id', function(request, response, next){
    bike.update({_id: request.params.id}, {
        name: request.body.name
    }, function(error) {
        if(error) response.send(error);
        response.redirect('/bikes');
    })
});

// DESTROY
router.delete('/bikes/:id', function(request, response, next){
    bike.findByIdAndRemove(request.params.id, function(error) {
        if(error) response.send(error);
        response.redirect('/bikes');
    })
});

app.use('/', router);

var server = http.createServer(app);
server.listen(port);
console.log('The magic happens on port ' + port);
