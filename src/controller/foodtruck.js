import mongoose from 'mongoose';
import { Router } from 'express';
import FoodTruck from '../model/foodtruck';
import Review from '../model/review';
import { authenticate } from '../middleware/authMiddleware';

export default ({ config, db }) => {
    let api = Router();

    // '/v1/foodtruck/add' - Create
    api.post('/add', authenticate, (req, res) => {
        let newFoodTruck = new FoodTruck();
        newFoodTruck.name = req.body.name;
        newFoodTruck.foodtype = req.body.foodtype;
        newFoodTruck.avgcost = req.body.avgcost;
        newFoodTruck.geometry.coordinates = req.body.geometry.coordinates;

        newFoodTruck.save(err => {
            if (err) {
                res.send(err);
            }
            res.json({ message: 'FoodTruck saved successfully' });
        });
    });

    // '/v1/foodtruck/' - Read
    api.get('/', (req, res) => {
        FoodTruck.find({}, (err, foodtrucks) => {
            if (err) {
                res.send(err);
            }
            res.json(foodtrucks);
        });
    });

    // '/v1/foodtruck/:id' - Read 1
    api.get('/:id', (req, res) => {
        FoodTruck.findById(req.params.id, (err, foodtruck) => {
            if (err) {
                res.send(err);
            }
            res.json(foodtruck);
        });
    });

    // Get all food trucks based on food type
    // '/v1/foodtruck/foodtype/:foodtype'
    api.get('/foodtype/:foodtype', (req, res) => {
        FoodTruck.find({ foodtype: req.params.foodtype }, (err, foodtrucks) => {
            if (err) {
                res.send(err);
            }
            res.json(foodtrucks);
        });
    });

    // '/v1/foodtruck/:id' - Update
    api.put('/:id', authenticate, (req, res) => {
        FoodTruck.findById(req.params.id, (err, foodtruck) => {
            if (err) {
                res.send(err);
            }
            foodtruck.name = req.body.name;
            foodtruck.foodtype = req.body.foodtype;
            foodtruck.avgcost = req.body.avgcost;
            foodtruck.geometry.coordinates = req.body.geometry.coordinates;
            foodtruck.save(err => {
                if (err) {
                    res.send(err);
                }
                res.json({ message: 'FoodTruck info updated' });
            });
        });
    });

    // '/v1/foodtruck/:id' - Delete
    api.delete('/:id', authenticate, (req, res) => {
        Review.remove({
            foodtruck: req.params.id
        }, (err, reviews) => {
            if (err) {
                res.send(err);
            }
            // If reviews deleted, remove foodtruck
            FoodTruck.remove({
                _id: req.params.id
            }, (err, foodtruck) => {
                if (err) {
                    res.send(err);
                }
                res.json({ message: 'FoodTruck and reviews successfully deleted' });
            });
        });
    });

    // add review for a specific food truck id
    // '/v1/foodtruck/reviews/add/:id'
    api.post('/reviews/add/:id', authenticate, (req, res) => {
        FoodTruck.findById(req.params.id, (err, foodtruck) => {
            if (err) {
                res.send(err);
            }
            let newReview = new Review();
            newReview.title = req.body.title;
            newReview.text = req.body.text;
            newReview.foodtruck = foodtruck._id;
            newReview.save((err, review) => {
                if (err) {
                    res.send(err);
                }
                foodtruck.reviews.push(newReview);
                foodtruck.save(err => {
                    if (err) {
                        res.send(err);
                    }
                    res.json({ message: 'Food truck review saved' });
                });
            });
        });
    });

    // Get all reviews for a specific food truck
    // '/v1/foodtruck/reviews/:id'
    api.get('/reviews/:id', (req, res) => {
        Review.find({ foodtruck: req.params.id }, (err, reviews) => {
            if (err) {
                res.send(err);
            }
            res.json(reviews);
        });
    });

    return api;
}