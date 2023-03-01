// I assumed that we will use chai-http to test the routes, but we can decide later.
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.use(chaiHttp);
const expect = chai.expect;

// Test the /GET route