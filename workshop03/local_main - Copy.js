const { join } = require('path');
const fs = require('fs');

//load the library
const preconditions = require('express-preconditions');

const cors = require('cors');
const range = require('express-range')
const compression = require('compression')

const { Validator, ValidationError } = require('express-json-validator-middleware')
const OpenAPIValidator = require('express-openapi-validator').OpenApiValidator;

const schemaValidator = new Validator({ allErrors: true, verbose: true });

const express = require('express')

const data = require('./zips')
const CitiesDB = require('./zipsdb')

//Load application keys
const db = CitiesDB(data);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

// TODO 1/2 Load schemans
new OpenAPIValidator({
    apiSpec: join(__dirname, 'schema', 'zips.yaml')
}).install(app)
    .then(() => {
        //ok we can proceed with the rest of our app
        // TODO 2/2 Copy your routes from workshop02 here
console.info('stARTING')
        // TODO GET /api/states
        app.get('/api/states',
            (req, resp) => { //handler
                const result = db.findAllStates();
                //set status code
                resp.status(200);
                //set Content-Yype
                resp.type('application/json');
                resp.set('X-generated-on', (new Date()).toDateString);
                //resp,set('Access-Control')
                resp.json(result)
            }
        )

        }

        // TODO GET /api/state/:state
        app.get('/api/state/:state',
            (req, resp) => { //handler
                const state = req.params.state
                const limit = parseInt(req.query.limit) || 10;
                const offset = parseInt(req.query.offset) || 10;

                console.info('>> state: ', state);
                const result = db.findCitiesByState(state,
                    { offset, limit });
                //{offset:offset, limit:limit} if the pair are the same then can do the above

                //set status code
                resp.status(200);
                //set Content-Yype
                resp.type('application/json');
                resp.set('X-generated-on', (new Date()).toDateString);
                //resp,set('Access-Control')
                resp.json(result)
            }
        )

        // TODO GET /api/city/:cityId
        //TODO DELETE /api/city/:name
        // TODO POST /api/city
        app.post('/api/city',
            (req, resp) => {
                const body = req.body;
                if (!db.validateForm(body)) {
                    resp.status(400)
                    resp.type('application/json')
                    resp.json({ 'message': 'incomplete form' })
                    return
                }
                db.insertCity(body)
                resp.status(201)
                resp.type('application/json')
                resp.json({ 'message': 'created' })


            }
        )


        // Optional workshop
        // TODO HEAD /api/state/:state
        // IMPORTANT: HEAD must be place before GET for the
        // same resource. Otherwise the GET handler will be invoked


        // TODO GET /state/:state/count
        app.get('/api/state/:state/count',
            (req, resp) => { //handler
                const state = req.params.state
                const count = db.countCitiesInState(state)

                result = {
                    state: state,
                    numOfCities: count,
                    timestamp: (new Date()).toDateString()
                }
                //set status code
                resp.status(200);
                //set Content-Yype
                resp.type('application/json');
                resp.set('X-generated-on', (new Date()).toDateString);
                //resp,set('Access-Control')
                resp.json(result)
            }
        )

        // TODO GET /api/city/:name


        // End of workshop

        app.use('/schema', express.static(join(__dirname, 'schema')));

        app.use((error, req, resp, next) => {

            if (error instanceof ValidationError) {
                console.error('Schema validation error: ', error)
                return resp.status(400).type('application/json').json({ error: error });
            }

            else if (error.status) {
                console.error('OpenAPI specification error: ', error)
                return resp.status(400).type('application/json').json({ error: error });
            }

            console.error('Error: ', error);
            resp.status(400).type('application/json').json({ error: error });

        });

        const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`);
        });

    })
    .catch(error => {

        console.error(">>> error: ", error)
    })


// End of workshop

