
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ssck = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// # simple-statistics
//
// A simple, literate statistics system.

var ssck = module.exports = {};

// Linear Regression
ssck.linearRegression = require('./src/linear_regression');
ssck.linearRegressionLine = require('./src/linear_regression_line');
ssck.standardDeviation = require('./src/standard_deviation');
ssck.rSquared = require('./src/r_squared');
ssck.mode = require('./src/mode');
ssck.min = require('./src/min');
ssck.max = require('./src/max');
ssck.sum = require('./src/sum');
ssck.quantile = require('./src/quantile');
ssck.quantileSorted = require('./src/quantile_sorted');
ssck.iqr = ssck.interquartileRange = require('./src/interquartile_range');
ssck.medianAbsoluteDeviation = ssck.mad = require('./src/mad');
ssck.chunk = require('./src/chunk');
ssck.shuffle = require('./src/shuffle');
ssck.shuffleInPlace = require('./src/shuffle_in_place');
ssck.sample = require('./src/sample');
ssck.ckmeans = require('./src/ckmeans');
ssck.sortedUniqueCount = require('./src/sorted_unique_count');
ssck.sumNthPowerDeviations = require('./src/sum_nth_power_deviations');

// sample statistics
ssck.sampleCovariance = require('./src/sample_covariance');
ssck.sampleCorrelation = require('./src/sample_correlation');
ssck.sampleVariance = require('./src/sample_variance');
ssck.sampleStandardDeviation = require('./src/sample_standard_deviation');
ssck.sampleSkewness = require('./src/sample_skewness');

// measures of centrality
ssck.geometricMean = require('./src/geometric_mean');
ssck.harmonicMean = require('./src/harmonic_mean');
ssck.mean = ssck.average = require('./src/mean');
ssck.median = require('./src/median');

ssck.rootMeanSquare = ssck.rms = require('./src/root_mean_square');
ssck.variance = require('./src/variance');
ssck.tTest = require('./src/t_test');
ssck.tTestTwoSample = require('./src/t_test_two_sample');
// ssck.jenks = require('./src/jenks');

// Classifiers
ssck.bayesian = require('./src/bayesian_classifier');
ssck.perceptron = require('./src/perceptron');

// Distribution-related methods
ssck.epsilon = require('./src/epsilon'); // We make ε available to the test suite.
ssck.factorial = require('./src/factorial');
ssck.bernoulliDistribution = require('./src/bernoulli_distribution');
ssck.binomialDistribution = require('./src/binomial_distribution');
ssck.poissonDistribution = require('./src/poisson_distribution');
ssck.chiSquaredGoodnessOfFit = require('./src/chi_squared_goodness_of_fit');

// Normal distribution
ssck.zScore = require('./src/z_score');
ssck.cumulativeStdNormalProbability = require('./src/cumulative_std_normal_probability');
ssck.standardNormalTable = require('./src/standard_normal_table');
ssck.errorFunction = ssck.erf = require('./src/error_function');
ssck.inverseErrorFunction = require('./src/inverse_error_function');
ssck.probit = require('./src/probit');
ssck.mixin = require('./src/mixin');

},{"./src/bayesian_classifier":2,"./src/bernoulli_distribution":3,"./src/binomial_distribution":4,"./src/chi_squared_goodness_of_fit":6,"./src/chunk":7,"./src/ckmeans":8,"./src/cumulative_std_normal_probability":9,"./src/epsilon":10,"./src/error_function":11,"./src/factorial":12,"./src/geometric_mean":13,"./src/harmonic_mean":14,"./src/interquartile_range":15,"./src/inverse_error_function":16,"./src/linear_regression":17,"./src/linear_regression_line":18,"./src/mad":19,"./src/max":20,"./src/mean":21,"./src/median":22,"./src/min":23,"./src/mixin":24,"./src/mode":25,"./src/perceptron":27,"./src/poisson_distribution":28,"./src/probit":29,"./src/quantile":30,"./src/quantile_sorted":31,"./src/r_squared":32,"./src/root_mean_square":33,"./src/sample":34,"./src/sample_correlation":35,"./src/sample_covariance":36,"./src/sample_skewness":37,"./src/sample_standard_deviation":38,"./src/sample_variance":39,"./src/shuffle":40,"./src/shuffle_in_place":41,"./src/sorted_unique_count":42,"./src/standard_deviation":43,"./src/standard_normal_table":44,"./src/sum":45,"./src/sum_nth_power_deviations":46,"./src/t_test":47,"./src/t_test_two_sample":48,"./src/variance":49,"./src/z_score":50}],2:[function(require,module,exports){
'use strict';

/**
 * [Bayesian Classifier](http://en.wikipedia.org/wiki/Naive_Bayes_classifier)
 *
 * This is a naïve bayesian classifier that takes
 * singly-nested objects.
 *
 * @class
 * @example
 * var bayes = new BayesianClassifier();
 * bayes.train({
 *   species: 'Cat'
 * }, 'animal');
 * var result = bayes.score({
 *   species: 'Cat'
 * })
 * // result
 * // {
 * //   animal: 1
 * // }
 */
function BayesianClassifier() {
    // The number of items that are currently
    // classified in the model
    this.totalCount = 0;
    // Every item classified in the model
    this.data = {};
}

/**
 * Train the classifier with a new item, which has a single
 * dimension of Javascript literal keys and values.
 *
 * @param {Object} item an object with singly-deep properties
 * @param {string} category the category this item belongs to
 * @return {undefined} adds the item to the classifier
 */
BayesianClassifier.prototype.train = function(item, category) {
    // If the data object doesn't have any values
    // for this category, create a new object for it.
    if (!this.data[category]) {
        this.data[category] = {};
    }

    // Iterate through each key in the item.
    for (var k in item) {
        var v = item[k];
        // Initialize the nested object `data[category][k][item[k]]`
        // with an object of keys that equal 0.
        if (this.data[category][k] === undefined) {
            this.data[category][k] = {};
        }
        if (this.data[category][k][v] === undefined) {
            this.data[category][k][v] = 0;
        }

        // And increment the key for this key/value combination.
        this.data[category][k][item[k]]++;
    }

    // Increment the number of items classified
    this.totalCount++;
};

/**
 * Generate a score of how well this item matches all
 * possible categories based on its attributes
 *
 * @param {Object} item an item in the same format as with train
 * @returns {Object} of probabilities that this item belongs to a
 * given category.
 */
BayesianClassifier.prototype.score = function(item) {
    // Initialize an empty array of odds per category.
    var odds = {}, category;
    // Iterate through each key in the item,
    // then iterate through each category that has been used
    // in previous calls to `.train()`
    for (var k in item) {
        var v = item[k];
        for (category in this.data) {
            // Create an empty object for storing key - value combinations
            // for this category.
            if (odds[category] === undefined) { odds[category] = {}; }

            // If this item doesn't even have a property, it counts for nothing,
            // but if it does have the property that we're looking for from
            // the item to categorize, it counts based on how popular it is
            // versus the whole population.
            if (this.data[category][k]) {
                odds[category][k + '_' + v] = (this.data[category][k][v] || 0) / this.totalCount;
            } else {
                odds[category][k + '_' + v] = 0;
            }
        }
    }

    // Set up a new object that will contain sums of these odds by category
    var oddsSums = {};

    for (category in odds) {
        // Tally all of the odds for each category-combination pair -
        // the non-existence of a category does not add anything to the
        // score.
        for (var combination in odds[category]) {
            if (oddsSums[category] === undefined) {
                oddsSums[category] = 0;
            }
            oddsSums[category] += odds[category][combination];
        }
    }

    return oddsSums;
};

module.exports = BayesianClassifier;

},{}],3:[function(require,module,exports){
'use strict';

var binomialDistribution = require('./binomial_distribution');

/**
 * The [Bernoulli distribution](http://en.wikipedia.org/wiki/Bernoulli_distribution)
 * is the probability discrete
 * distribution of a random variable which takes value 1 with success
 * probability `p` and value 0 with failure
 * probability `q` = 1 - `p`. It can be used, for example, to represent the
 * toss of a coin, where "1" is defined to mean "heads" and "0" is defined
 * to mean "tails" (or vice versa). It is
 * a special case of a Binomial Distribution
 * where `n` = 1.
 *
 * @param {number} p input value, between 0 and 1 inclusive
 * @returns {number} value of bernoulli distribution at this point
 */
function bernoulliDistribution(p) {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1)
    if (p < 0 || p > 1 ) { return null; }

    return binomialDistribution(1, p);
}

module.exports = bernoulliDistribution;

},{"./binomial_distribution":4}],4:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var factorial = require('./factorial');

/**
 * The [Binomial Distribution](http://en.wikipedia.org/wiki/Binomial_distribution) is the discrete probability
 * distribution of the number of successes in a sequence of n independent yes/no experiments, each of which yields
 * success with probability `probability`. Such a success/failure experiment is also called a Bernoulli experiment or
 * Bernoulli trial; when trials = 1, the Binomial Distribution is a Bernoulli Distribution.
 *
 * @param {number} trials number of trials to simulate
 * @param {number} probability
 * @returns {number} output
 */
function binomialDistribution(trials, probability) {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1),
    // that `n` is an integer, strictly positive.
    if (probability < 0 || probability > 1 ||
        trials <= 0 || trials % 1 !== 0) {
        return null;
    }

    // We initialize `x`, the random variable, and `accumulator`, an accumulator
    // for the cumulative distribution function to 0. `distribution_functions`
    // is the object we'll return with the `probability_of_x` and the
    // `cumulativeProbability_of_x`, as well as the calculated mean &
    // variance. We iterate until the `cumulativeProbability_of_x` is
    // within `epsilon` of 1.0.
    var x = 0,
        cumulativeProbability = 0,
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = factorial(trials) /
            (factorial(x) * factorial(trials - x)) *
            (Math.pow(probability, x) * Math.pow(1 - probability, trials - x));
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = binomialDistribution;

},{"./epsilon":10,"./factorial":12}],5:[function(require,module,exports){
'use strict';

/**
 * **Percentage Points of the χ2 (Chi-Squared) Distribution**
 *
 * The [χ2 (Chi-Squared) Distribution](http://en.wikipedia.org/wiki/Chi-squared_distribution) is used in the common
 * chi-squared tests for goodness of fit of an observed distribution to a theoretical one, the independence of two
 * criteria of classification of qualitative data, and in confidence interval estimation for a population standard
 * deviation of a normal distribution from a sample standard deviation.
 *
 * Values from Appendix 1, Table III of William W. Hines & Douglas C. Montgomery, "Probability and Statistics in
 * Engineering and Management Science", Wiley (1980).
 */
var chiSquaredDistributionTable = {
    1: { 0.995:  0.00, 0.99:  0.00, 0.975:  0.00, 0.95:  0.00, 0.9:  0.02, 0.5:  0.45, 0.1:  2.71, 0.05:  3.84, 0.025:  5.02, 0.01:  6.63, 0.005:  7.88 },
    2: { 0.995:  0.01, 0.99:  0.02, 0.975:  0.05, 0.95:  0.10, 0.9:  0.21, 0.5:  1.39, 0.1:  4.61, 0.05:  5.99, 0.025:  7.38, 0.01:  9.21, 0.005: 10.60 },
    3: { 0.995:  0.07, 0.99:  0.11, 0.975:  0.22, 0.95:  0.35, 0.9:  0.58, 0.5:  2.37, 0.1:  6.25, 0.05:  7.81, 0.025:  9.35, 0.01: 11.34, 0.005: 12.84 },
    4: { 0.995:  0.21, 0.99:  0.30, 0.975:  0.48, 0.95:  0.71, 0.9:  1.06, 0.5:  3.36, 0.1:  7.78, 0.05:  9.49, 0.025: 11.14, 0.01: 13.28, 0.005: 14.86 },
    5: { 0.995:  0.41, 0.99:  0.55, 0.975:  0.83, 0.95:  1.15, 0.9:  1.61, 0.5:  4.35, 0.1:  9.24, 0.05: 11.07, 0.025: 12.83, 0.01: 15.09, 0.005: 16.75 },
    6: { 0.995:  0.68, 0.99:  0.87, 0.975:  1.24, 0.95:  1.64, 0.9:  2.20, 0.5:  5.35, 0.1: 10.65, 0.05: 12.59, 0.025: 14.45, 0.01: 16.81, 0.005: 18.55 },
    7: { 0.995:  0.99, 0.99:  1.25, 0.975:  1.69, 0.95:  2.17, 0.9:  2.83, 0.5:  6.35, 0.1: 12.02, 0.05: 14.07, 0.025: 16.01, 0.01: 18.48, 0.005: 20.28 },
    8: { 0.995:  1.34, 0.99:  1.65, 0.975:  2.18, 0.95:  2.73, 0.9:  3.49, 0.5:  7.34, 0.1: 13.36, 0.05: 15.51, 0.025: 17.53, 0.01: 20.09, 0.005: 21.96 },
    9: { 0.995:  1.73, 0.99:  2.09, 0.975:  2.70, 0.95:  3.33, 0.9:  4.17, 0.5:  8.34, 0.1: 14.68, 0.05: 16.92, 0.025: 19.02, 0.01: 21.67, 0.005: 23.59 },
    10: { 0.995:  2.16, 0.99:  2.56, 0.975:  3.25, 0.95:  3.94, 0.9:  4.87, 0.5:  9.34, 0.1: 15.99, 0.05: 18.31, 0.025: 20.48, 0.01: 23.21, 0.005: 25.19 },
    11: { 0.995:  2.60, 0.99:  3.05, 0.975:  3.82, 0.95:  4.57, 0.9:  5.58, 0.5: 10.34, 0.1: 17.28, 0.05: 19.68, 0.025: 21.92, 0.01: 24.72, 0.005: 26.76 },
    12: { 0.995:  3.07, 0.99:  3.57, 0.975:  4.40, 0.95:  5.23, 0.9:  6.30, 0.5: 11.34, 0.1: 18.55, 0.05: 21.03, 0.025: 23.34, 0.01: 26.22, 0.005: 28.30 },
    13: { 0.995:  3.57, 0.99:  4.11, 0.975:  5.01, 0.95:  5.89, 0.9:  7.04, 0.5: 12.34, 0.1: 19.81, 0.05: 22.36, 0.025: 24.74, 0.01: 27.69, 0.005: 29.82 },
    14: { 0.995:  4.07, 0.99:  4.66, 0.975:  5.63, 0.95:  6.57, 0.9:  7.79, 0.5: 13.34, 0.1: 21.06, 0.05: 23.68, 0.025: 26.12, 0.01: 29.14, 0.005: 31.32 },
    15: { 0.995:  4.60, 0.99:  5.23, 0.975:  6.27, 0.95:  7.26, 0.9:  8.55, 0.5: 14.34, 0.1: 22.31, 0.05: 25.00, 0.025: 27.49, 0.01: 30.58, 0.005: 32.80 },
    16: { 0.995:  5.14, 0.99:  5.81, 0.975:  6.91, 0.95:  7.96, 0.9:  9.31, 0.5: 15.34, 0.1: 23.54, 0.05: 26.30, 0.025: 28.85, 0.01: 32.00, 0.005: 34.27 },
    17: { 0.995:  5.70, 0.99:  6.41, 0.975:  7.56, 0.95:  8.67, 0.9: 10.09, 0.5: 16.34, 0.1: 24.77, 0.05: 27.59, 0.025: 30.19, 0.01: 33.41, 0.005: 35.72 },
    18: { 0.995:  6.26, 0.99:  7.01, 0.975:  8.23, 0.95:  9.39, 0.9: 10.87, 0.5: 17.34, 0.1: 25.99, 0.05: 28.87, 0.025: 31.53, 0.01: 34.81, 0.005: 37.16 },
    19: { 0.995:  6.84, 0.99:  7.63, 0.975:  8.91, 0.95: 10.12, 0.9: 11.65, 0.5: 18.34, 0.1: 27.20, 0.05: 30.14, 0.025: 32.85, 0.01: 36.19, 0.005: 38.58 },
    20: { 0.995:  7.43, 0.99:  8.26, 0.975:  9.59, 0.95: 10.85, 0.9: 12.44, 0.5: 19.34, 0.1: 28.41, 0.05: 31.41, 0.025: 34.17, 0.01: 37.57, 0.005: 40.00 },
    21: { 0.995:  8.03, 0.99:  8.90, 0.975: 10.28, 0.95: 11.59, 0.9: 13.24, 0.5: 20.34, 0.1: 29.62, 0.05: 32.67, 0.025: 35.48, 0.01: 38.93, 0.005: 41.40 },
    22: { 0.995:  8.64, 0.99:  9.54, 0.975: 10.98, 0.95: 12.34, 0.9: 14.04, 0.5: 21.34, 0.1: 30.81, 0.05: 33.92, 0.025: 36.78, 0.01: 40.29, 0.005: 42.80 },
    23: { 0.995:  9.26, 0.99: 10.20, 0.975: 11.69, 0.95: 13.09, 0.9: 14.85, 0.5: 22.34, 0.1: 32.01, 0.05: 35.17, 0.025: 38.08, 0.01: 41.64, 0.005: 44.18 },
    24: { 0.995:  9.89, 0.99: 10.86, 0.975: 12.40, 0.95: 13.85, 0.9: 15.66, 0.5: 23.34, 0.1: 33.20, 0.05: 36.42, 0.025: 39.36, 0.01: 42.98, 0.005: 45.56 },
    25: { 0.995: 10.52, 0.99: 11.52, 0.975: 13.12, 0.95: 14.61, 0.9: 16.47, 0.5: 24.34, 0.1: 34.28, 0.05: 37.65, 0.025: 40.65, 0.01: 44.31, 0.005: 46.93 },
    26: { 0.995: 11.16, 0.99: 12.20, 0.975: 13.84, 0.95: 15.38, 0.9: 17.29, 0.5: 25.34, 0.1: 35.56, 0.05: 38.89, 0.025: 41.92, 0.01: 45.64, 0.005: 48.29 },
    27: { 0.995: 11.81, 0.99: 12.88, 0.975: 14.57, 0.95: 16.15, 0.9: 18.11, 0.5: 26.34, 0.1: 36.74, 0.05: 40.11, 0.025: 43.19, 0.01: 46.96, 0.005: 49.65 },
    28: { 0.995: 12.46, 0.99: 13.57, 0.975: 15.31, 0.95: 16.93, 0.9: 18.94, 0.5: 27.34, 0.1: 37.92, 0.05: 41.34, 0.025: 44.46, 0.01: 48.28, 0.005: 50.99 },
    29: { 0.995: 13.12, 0.99: 14.26, 0.975: 16.05, 0.95: 17.71, 0.9: 19.77, 0.5: 28.34, 0.1: 39.09, 0.05: 42.56, 0.025: 45.72, 0.01: 49.59, 0.005: 52.34 },
    30: { 0.995: 13.79, 0.99: 14.95, 0.975: 16.79, 0.95: 18.49, 0.9: 20.60, 0.5: 29.34, 0.1: 40.26, 0.05: 43.77, 0.025: 46.98, 0.01: 50.89, 0.005: 53.67 },
    40: { 0.995: 20.71, 0.99: 22.16, 0.975: 24.43, 0.95: 26.51, 0.9: 29.05, 0.5: 39.34, 0.1: 51.81, 0.05: 55.76, 0.025: 59.34, 0.01: 63.69, 0.005: 66.77 },
    50: { 0.995: 27.99, 0.99: 29.71, 0.975: 32.36, 0.95: 34.76, 0.9: 37.69, 0.5: 49.33, 0.1: 63.17, 0.05: 67.50, 0.025: 71.42, 0.01: 76.15, 0.005: 79.49 },
    60: { 0.995: 35.53, 0.99: 37.48, 0.975: 40.48, 0.95: 43.19, 0.9: 46.46, 0.5: 59.33, 0.1: 74.40, 0.05: 79.08, 0.025: 83.30, 0.01: 88.38, 0.005: 91.95 },
    70: { 0.995: 43.28, 0.99: 45.44, 0.975: 48.76, 0.95: 51.74, 0.9: 55.33, 0.5: 69.33, 0.1: 85.53, 0.05: 90.53, 0.025: 95.02, 0.01: 100.42, 0.005: 104.22 },
    80: { 0.995: 51.17, 0.99: 53.54, 0.975: 57.15, 0.95: 60.39, 0.9: 64.28, 0.5: 79.33, 0.1: 96.58, 0.05: 101.88, 0.025: 106.63, 0.01: 112.33, 0.005: 116.32 },
    90: { 0.995: 59.20, 0.99: 61.75, 0.975: 65.65, 0.95: 69.13, 0.9: 73.29, 0.5: 89.33, 0.1: 107.57, 0.05: 113.14, 0.025: 118.14, 0.01: 124.12, 0.005: 128.30 },
    100: { 0.995: 67.33, 0.99: 70.06, 0.975: 74.22, 0.95: 77.93, 0.9: 82.36, 0.5: 99.33, 0.1: 118.50, 0.05: 124.34, 0.025: 129.56, 0.01: 135.81, 0.005: 140.17 }
};

module.exports = chiSquaredDistributionTable;

},{}],6:[function(require,module,exports){
'use strict';

var mean = require('./mean');
var chiSquaredDistributionTable = require('./chi_squared_distribution_table');

/**
 * The [χ2 (Chi-Squared) Goodness-of-Fit Test](http://en.wikipedia.org/wiki/Goodness_of_fit#Pearson.27s_chi-squared_test)
 * uses a measure of goodness of fit which is the sum of differences between observed and expected outcome frequencies
 * (that is, counts of observations), each squared and divided by the number of observations expected given the
 * hypothesized distribution. The resulting χ2 statistic, `chiSquared`, can be compared to the chi-squared distribution
 * to determine the goodness of fit. In order to determine the degrees of freedom of the chi-squared distribution, one
 * takes the total number of observed frequencies and subtracts the number of estimated parameters. The test statistic
 * follows, approximately, a chi-square distribution with (k − c) degrees of freedom where `k` is the number of non-empty
 * cells and `c` is the number of estimated parameters for the distribution.
 *
 * @param {Array<number>} data
 * @param {Function} distributionType a function that returns a point in a distribution:
 * for instance, binomial, bernoulli, or poisson
 * @param {number} significance
 * @returns {number} chi squared goodness of fit
 * @example
 * // Data from Poisson goodness-of-fit example 10-19 in William W. Hines & Douglas C. Montgomery,
 * // "Probability and Statistics in Engineering and Management Science", Wiley (1980).
 * var data1019 = [
 *     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 *     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 *     1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
 *     2, 2, 2, 2, 2, 2, 2, 2, 2,
 *     3, 3, 3, 3
 * ];
 * ss.chiSquaredGoodnessOfFit(data1019, ss.poissonDistribution, 0.05)); //= false
 */
function chiSquaredGoodnessOfFit(data, distributionType, significance) {
    // Estimate from the sample data, a weighted mean.
    var inputMean = mean(data),
        // Calculated value of the χ2 statistic.
        chiSquared = 0,
        // Degrees of freedom, calculated as (number of class intervals -
        // number of hypothesized distribution parameters estimated - 1)
        degreesOfFreedom,
        // Number of hypothesized distribution parameters estimated, expected to be supplied in the distribution test.
        // Lose one degree of freedom for estimating `lambda` from the sample data.
        c = 1,
        // The hypothesized distribution.
        // Generate the hypothesized distribution.
        hypothesizedDistribution = distributionType(inputMean),
        observedFrequencies = [],
        expectedFrequencies = [],
        k;

    // Create an array holding a histogram from the sample data, of
    // the form `{ value: numberOfOcurrences }`
    for (var i = 0; i < data.length; i++) {
        if (observedFrequencies[data[i]] === undefined) {
            observedFrequencies[data[i]] = 0;
        }
        observedFrequencies[data[i]]++;
    }

    // The histogram we created might be sparse - there might be gaps
    // between values. So we iterate through the histogram, making
    // sure that instead of undefined, gaps have 0 values.
    for (i = 0; i < observedFrequencies.length; i++) {
        if (observedFrequencies[i] === undefined) {
            observedFrequencies[i] = 0;
        }
    }

    // Create an array holding a histogram of expected data given the
    // sample size and hypothesized distribution.
    for (k in hypothesizedDistribution) {
        if (k in observedFrequencies) {
            expectedFrequencies[k] = hypothesizedDistribution[k] * data.length;
        }
    }

    // Working backward through the expected frequencies, collapse classes
    // if less than three observations are expected for a class.
    // This transformation is applied to the observed frequencies as well.
    for (k = expectedFrequencies.length - 1; k >= 0; k--) {
        if (expectedFrequencies[k] < 3) {
            expectedFrequencies[k - 1] += expectedFrequencies[k];
            expectedFrequencies.pop();

            observedFrequencies[k - 1] += observedFrequencies[k];
            observedFrequencies.pop();
        }
    }

    // Iterate through the squared differences between observed & expected
    // frequencies, accumulating the `chiSquared` statistic.
    for (k = 0; k < observedFrequencies.length; k++) {
        chiSquared += Math.pow(
            observedFrequencies[k] - expectedFrequencies[k], 2) /
            expectedFrequencies[k];
    }

    // Calculate degrees of freedom for this test and look it up in the
    // `chiSquaredDistributionTable` in order to
    // accept or reject the goodness-of-fit of the hypothesized distribution.
    degreesOfFreedom = observedFrequencies.length - c - 1;
    return chiSquaredDistributionTable[degreesOfFreedom][significance] < chiSquared;
}

module.exports = chiSquaredGoodnessOfFit;

},{"./chi_squared_distribution_table":5,"./mean":21}],7:[function(require,module,exports){
'use strict';

/**
 * Split an array into chunks of a specified size. This function
 * has the same behavior as [PHP's array_chunk](http://php.net/manual/en/function.array-chunk.php)
 * function, and thus will insert smaller-sized chunks at the end if
 * the input size is not divisible by the chunk size.
 *
 * `sample` is expected to be an array, and `chunkSize` a number.
 * The `sample` array can contain any kind of data.
 *
 * @param {Array} sample any array of values
 * @param {number} chunkSize size of each output array
 * @returns {Array<Array>} a chunked array
 * @example
 * console.log(chunk([1, 2, 3, 4], 2)); // [[1, 2], [3, 4]]
 */
function chunk(sample, chunkSize) {

    // a list of result chunks, as arrays in an array
    var output = [];

    // `chunkSize` must be zero or higher - otherwise the loop below,
    // in which we call `start += chunkSize`, will loop infinitely.
    // So, we'll detect and return null in that case to indicate
    // invalid input.
    if (chunkSize <= 0) {
        return null;
    }

    // `start` is the index at which `.slice` will start selecting
    // new array elements
    for (var start = 0; start < sample.length; start += chunkSize) {

        // for each chunk, slice that part of the array and add it
        // to the output. The `.slice` function does not change
        // the original array.
        output.push(sample.slice(start, start + chunkSize));
    }
    return output;
}

module.exports = chunk;

},{}],8:[function(require,module,exports){
'use strict';

var sortedUniqueCount = require('./sorted_unique_count'),
    numericSort = require('./numeric_sort');

/**
 * Create a new column x row matrix.
 *
 * @private
 * @param {number} columns
 * @param {number} rows
 * @return {Array<Array<number>>} matrix
 * @example
 * makeMatrix(10, 10);
 */
function makeMatrix(columns, rows) {
    var matrix = [];
    for (var i = 0; i < columns; i++) {
        var column = [];
        for (var j = 0; j < rows; j++) {
            column.push(0);
        }
        matrix.push(column);
    }
    return matrix;
}

/**
 * Ckmeans clustering is an improvement on heuristic-based clustering
 * approaches like Jenks. The algorithm was developed in
 * [Haizhou Wang and Mingzhou Song](http://journal.r-project.org/archive/2011-2/RJournal_2011-2_Wang+Song.pdf)
 * as a [dynamic programming](https://en.wikipedia.org/wiki/Dynamic_programming) approach
 * to the problem of clustering numeric data into groups with the least
 * within-group sum-of-squared-deviations.
 *
 * Minimizing the difference within groups - what Wang & Song refer to as
 * `withinss`, or within sum-of-squares, means that groups are optimally
 * homogenous within and the data is split into representative groups.
 * This is very useful for visualization, where you may want to represent
 * a continuous variable in discrete color or style groups. This function
 * can provide groups that emphasize differences between data.
 *
 * Being a dynamic approach, this algorithm is based on two matrices that
 * store incrementally-computed values for squared deviations and backtracking
 * indexes.
 *
 * Unlike the [original implementation](https://cran.r-project.org/web/packages/Ckmeans.1d.dp/index.html),
 * this implementation does not include any code to automatically determine
 * the optimal number of clusters: this information needs to be explicitly
 * provided.
 *
 * ### References
 * _Ckmeans.1d.dp: Optimal k-means Clustering in One Dimension by Dynamic
 * Programming_ Haizhou Wang and Mingzhou Song ISSN 2073-4859
 *
 * from The R Journal Vol. 3/2, December 2011
 * @param {Array<number>} data input data, as an array of number values
 * @param {number} nClusters number of desired classes. This cannot be
 * greater than the number of values in the data array.
 * @returns {Array<Array<number>>} clustered input
 * @example
 * ckmeans([-1, 2, -1, 2, 4, 5, 6, -1, 2, -1], 3);
 * // The input, clustered into groups of similar numbers.
 * //= [[-1, -1, -1, -1], [2, 2, 2], [4, 5, 6]]);
 */
function ckmeans(data, nClusters) {

    if (nClusters > data.length) {
        throw new Error('Cannot generate more classes than there are data values');
    }

    var sorted = numericSort(data),
        // we'll use this as the maximum number of clusters
        uniqueCount = sortedUniqueCount(sorted);

    // if all of the input values are identical, there's one cluster
    // with all of the input in it.
    if (uniqueCount === 1) {
        return [sorted];
    }

    // named 'D' originally
    var matrix = makeMatrix(nClusters, sorted.length),
        // named 'B' originally
        backtrackMatrix = makeMatrix(nClusters, sorted.length);

    // This is a dynamic programming way to solve the problem of minimizing
    // within-cluster sum of squares. It's similar to linear regression
    // in this way, and this calculation incrementally computes the
    // sum of squares that are later read.

    // The outer loop iterates through clusters, from 0 to nClusters.
    for (var cluster = 0; cluster < nClusters; cluster++) {

        // At the start of each loop, the mean starts as the first element
        var firstClusterMean = sorted[0];

        for (var sortedIdx = Math.max(cluster, 1);
             sortedIdx < sorted.length;
             sortedIdx++) {

            if (cluster === 0) {

                // Increase the running sum of squares calculation by this
                // new value
                var squaredDifference = Math.pow(
                    sorted[sortedIdx] - firstClusterMean, 2);
                matrix[cluster][sortedIdx] = matrix[cluster][sortedIdx - 1] +
                    ((sortedIdx - 1) / sortedIdx) * squaredDifference;

                // We're computing a running mean by taking the previous
                // mean value, multiplying it by the number of elements
                // seen so far, and then dividing it by the number of
                // elements total.
                var newSum = sortedIdx * firstClusterMean + sorted[sortedIdx];
                firstClusterMean = newSum / sortedIdx;

            } else {

                var sumSquaredDistances = 0,
                    meanXJ = 0;

                for (var j = sortedIdx; j >= cluster; j--) {

                    sumSquaredDistances += (sortedIdx - j) /
                        (sortedIdx - j + 1) *
                        Math.pow(sorted[j] - meanXJ, 2);

                    meanXJ = (sorted[j] + ((sortedIdx - j) * meanXJ)) /
                        (sortedIdx - j + 1);

                    if (j === sortedIdx) {
                        matrix[cluster][sortedIdx] = sumSquaredDistances;
                        backtrackMatrix[cluster][sortedIdx] = j;
                        if (j > 0) {
                            matrix[cluster][sortedIdx] += matrix[cluster - 1][j - 1];
                        }
                    } else {
                        if (j === 0) {
                            if (sumSquaredDistances <= matrix[cluster][sortedIdx]) {
                                matrix[cluster][sortedIdx] = sumSquaredDistances;
                                backtrackMatrix[cluster][sortedIdx] = j;
                            }
                        } else if (sumSquaredDistances + matrix[cluster - 1][j - 1] < matrix[cluster][sortedIdx]) {
                            matrix[cluster][sortedIdx] = sumSquaredDistances + matrix[cluster - 1][j - 1];
                            backtrackMatrix[cluster][sortedIdx] = j;
                        }
                    }
                }
            }
        }
    }

    // The real work of Ckmeans clustering happens in the matrix generation:
    // the generated matrices encode all possible clustering combinations, and
    // once they're generated we can solve for the best clustering groups
    // very quickly.
    var clusters = [],
        clusterRight = backtrackMatrix[0].length - 1;

    // Backtrack the clusters from the dynamic programming matrix. This
    // starts at the bottom-right corner of the matrix (if the top-left is 0, 0),
    // and moves the cluster target with the loop.
    for (cluster = backtrackMatrix.length - 1; cluster >= 0; cluster--) {

        var clusterLeft = backtrackMatrix[cluster][clusterRight];

        // fill the cluster from the sorted input by taking a slice of the
        // array. the backtrack matrix makes this easy - it stores the
        // indexes where the cluster should start and end.
        clusters[cluster] = sorted.slice(clusterLeft, clusterRight + 1);

        if (cluster > 0) {
            clusterRight = clusterLeft - 1;
        }
    }

    return clusters;
}

module.exports = ckmeans;

},{"./numeric_sort":26,"./sorted_unique_count":42}],9:[function(require,module,exports){
'use strict';

var standardNormalTable = require('./standard_normal_table');

/**
 * **[Cumulative Standard Normal Probability](http://en.wikipedia.org/wiki/Standard_normal_table)**
 *
 * Since probability tables cannot be
 * printed for every normal distribution, as there are an infinite variety
 * of normal distributions, it is common practice to convert a normal to a
 * standard normal and then use the standard normal table to find probabilities.
 *
 * You can use `.5 + .5 * errorFunction(x / Math.sqrt(2))` to calculate the probability
 * instead of looking it up in a table.
 *
 * @param {number} z
 * @returns {number} cumulative standard normal probability
 */
function cumulativeStdNormalProbability(z) {

    // Calculate the position of this value.
    var absZ = Math.abs(z),
        // Each row begins with a different
        // significant digit: 0.5, 0.6, 0.7, and so on. Each value in the table
        // corresponds to a range of 0.01 in the input values, so the value is
        // multiplied by 100.
        index = Math.min(Math.round(absZ * 100), standardNormalTable.length - 1);

    // The index we calculate must be in the table as a positive value,
    // but we still pay attention to whether the input is positive
    // or negative, and flip the output value as a last step.
    if (z >= 0) {
        return standardNormalTable[index];
    } else {
        // due to floating-point arithmetic, values in the table with
        // 4 significant figures can nevertheless end up as repeating
        // fractions when they're computed here.
        return +(1 - standardNormalTable[index]).toFixed(4);
    }
}

module.exports = cumulativeStdNormalProbability;

},{"./standard_normal_table":44}],10:[function(require,module,exports){
'use strict';

/**
 * We use `ε`, epsilon, as a stopping criterion when we want to iterate
 * until we're "close enough".
 *
 * This is used in calculations like the binomialDistribution, in which
 * the process of finding a value is [iterative](https://en.wikipedia.org/wiki/Iterative_method):
 * it progresses until it is close enough.
 */
var epsilon = 0.0001;

module.exports = epsilon;

},{}],11:[function(require,module,exports){
'use strict';

/**
 * **[Gaussian error function](http://en.wikipedia.org/wiki/Error_function)**
 *
 * The `errorFunction(x/(sd * Math.sqrt(2)))` is the probability that a value in a
 * normal distribution with standard deviation sd is within x of the mean.
 *
 * This function returns a numerical approximation to the exact value.
 *
 * @param {number} x input
 * @return {number} error estimation
 * @example
 * errorFunction(1); //= 0.8427
 */
function errorFunction(x) {
    var t = 1 / (1 + 0.5 * Math.abs(x));
    var tau = t * Math.exp(-Math.pow(x, 2) -
        1.26551223 +
        1.00002368 * t +
        0.37409196 * Math.pow(t, 2) +
        0.09678418 * Math.pow(t, 3) -
        0.18628806 * Math.pow(t, 4) +
        0.27886807 * Math.pow(t, 5) -
        1.13520398 * Math.pow(t, 6) +
        1.48851587 * Math.pow(t, 7) -
        0.82215223 * Math.pow(t, 8) +
        0.17087277 * Math.pow(t, 9));
    if (x >= 0) {
        return 1 - tau;
    } else {
        return tau - 1;
    }
}

module.exports = errorFunction;

},{}],12:[function(require,module,exports){
'use strict';

/**
 * A [Factorial](https://en.wikipedia.org/wiki/Factorial), usually written n!, is the product of all positive
 * integers less than or equal to n. Often factorial is implemented
 * recursively, but this iterative approach is significantly faster
 * and simpler.
 *
 * @param {number} n input
 * @returns {number} factorial: n!
 * @example
 * console.log(factorial(5)); // 120
 */
function factorial(n) {

    // factorial is mathematically undefined for negative numbers
    if (n < 0 ) { return null; }

    // typically you'll expand the factorial function going down, like
    // 5! = 5 * 4 * 3 * 2 * 1. This is going in the opposite direction,
    // counting from 2 up to the number in question, and since anything
    // multiplied by 1 is itself, the loop only needs to start at 2.
    var accumulator = 1;
    for (var i = 2; i <= n; i++) {
        // for each number up to and including the number `n`, multiply
        // the accumulator my that number.
        accumulator *= i;
    }
    return accumulator;
}

module.exports = factorial;

},{}],13:[function(require,module,exports){
'use strict';

/**
 * The [Geometric Mean](https://en.wikipedia.org/wiki/Geometric_mean) is
 * a mean function that is more useful for numbers in different
 * ranges.
 *
 * This is the nth root of the input numbers multiplied by each other.
 *
 * The geometric mean is often useful for
 * **[proportional growth](https://en.wikipedia.org/wiki/Geometric_mean#Proportional_growth)**: given
 * growth rates for multiple years, like _80%, 16.66% and 42.85%_, a simple
 * mean will incorrectly estimate an average growth rate, whereas a geometric
 * mean will correctly estimate a growth rate that, over those years,
 * will yield the same end value.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input array
 * @returns {number} geometric mean
 * @example
 * var growthRates = [1.80, 1.166666, 1.428571];
 * var averageGrowth = geometricMean(growthRates);
 * var averageGrowthRates = [averageGrowth, averageGrowth, averageGrowth];
 * var startingValue = 10;
 * var startingValueMean = 10;
 * growthRates.forEach(function(rate) {
 *   startingValue *= rate;
 * });
 * averageGrowthRates.forEach(function(rate) {
 *   startingValueMean *= rate;
 * });
 * startingValueMean === startingValue;
 */
function geometricMean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    // the starting value.
    var value = 1;

    for (var i = 0; i < x.length; i++) {
        // the geometric mean is only valid for positive numbers
        if (x[i] <= 0) { return null; }

        // repeatedly multiply the value by each number
        value *= x[i];
    }

    return Math.pow(value, 1 / x.length);
}

module.exports = geometricMean;

},{}],14:[function(require,module,exports){
'use strict';

/**
 * The [Harmonic Mean](https://en.wikipedia.org/wiki/Harmonic_mean) is
 * a mean function typically used to find the average of rates.
 * This mean is calculated by taking the reciprocal of the arithmetic mean
 * of the reciprocals of the input numbers.
 *
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array.
 *
 * @param {Array<number>} x input
 * @returns {number} harmonic mean
 * @example
 * ss.harmonicMean([2, 3]) //= 2.4
 */
function harmonicMean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    var reciprocalSum = 0;

    for (var i = 0; i < x.length; i++) {
        // the harmonic mean is only valid for positive numbers
        if (x[i] <= 0) { return null; }

        reciprocalSum += 1 / x[i];
    }

    // divide n by the the reciprocal sum
    return x.length / reciprocalSum;
}

module.exports = harmonicMean;

},{}],15:[function(require,module,exports){
'use strict';

var quantile = require('./quantile');

/**
 * The [Interquartile range](http://en.wikipedia.org/wiki/Interquartile_range) is
 * a measure of statistical dispersion, or how scattered, spread, or
 * concentrated a distribution is. It's computed as the difference between
 * the third quartile and first quartile.
 *
 * @param {Array<number>} sample
 * @returns {number} interquartile range: the span between lower and upper quartile,
 * 0.25 and 0.75
 * @example
 * interquartileRange([0, 1, 2, 3]); //= 2
 */
function interquartileRange(sample) {
    // We can't derive quantiles from an empty list
    if (sample.length === 0) { return null; }

    // Interquartile range is the span between the upper quartile,
    // at `0.75`, and lower quartile, `0.25`
    return quantile(sample, 0.75) - quantile(sample, 0.25);
}

module.exports = interquartileRange;

},{"./quantile":30}],16:[function(require,module,exports){
'use strict';

/**
 * The Inverse [Gaussian error function](http://en.wikipedia.org/wiki/Error_function)
 * returns a numerical approximation to the value that would have caused
 * `errorFunction()` to return x.
 *
 * @param {number} x value of error function
 * @returns {number} estimated inverted value
 */
function inverseErrorFunction(x) {
    var a = (8 * (Math.PI - 3)) / (3 * Math.PI * (4 - Math.PI));

    var inv = Math.sqrt(Math.sqrt(
            Math.pow(2 / (Math.PI * a) + Math.log(1 - x * x) / 2, 2) -
            Math.log(1 - x * x) / a) -
            (2 / (Math.PI * a) + Math.log(1 - x * x) / 2));

    if (x >= 0) {
        return inv;
    } else {
        return -inv;
    }
}

module.exports = inverseErrorFunction;

},{}],17:[function(require,module,exports){
'use strict';

/**
 * [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
 * is a simple way to find a fitted line
 * between a set of coordinates. This algorithm finds the slope and y-intercept of a regression line
 * using the least sum of squares.
 *
 * @param {Array<Array<number>>} data an array of two-element of arrays,
 * like `[[0, 1], [2, 3]]`
 * @returns {Object} object containing slope and intersect of regression line
 * @example
 * linearRegression([[0, 0], [1, 1]]); // { m: 1, b: 0 }
 */
function linearRegression(data) {

    var m, b;

    // Store data length in a local variable to reduce
    // repeated object property lookups
    var dataLength = data.length;

    //if there's only one point, arbitrarily choose a slope of 0
    //and a y-intercept of whatever the y of the initial point is
    if (dataLength === 1) {
        m = 0;
        b = data[0][1];
    } else {
        // Initialize our sums and scope the `m` and `b`
        // variables that define the line.
        var sumX = 0, sumY = 0,
            sumXX = 0, sumXY = 0;

        // Use local variables to grab point values
        // with minimal object property lookups
        var point, x, y;

        // Gather the sum of all x values, the sum of all
        // y values, and the sum of x^2 and (x*y) for each
        // value.
        //
        // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy
        for (var i = 0; i < dataLength; i++) {
            point = data[i];
            x = point[0];
            y = point[1];

            sumX += x;
            sumY += y;

            sumXX += x * x;
            sumXY += x * y;
        }

        // `m` is the slope of the regression line
        m = ((dataLength * sumXY) - (sumX * sumY)) /
            ((dataLength * sumXX) - (sumX * sumX));

        // `b` is the y-intercept of the line.
        b = (sumY / dataLength) - ((m * sumX) / dataLength);
    }

    // Return both values as an object.
    return {
        m: m,
        b: b
    };
}


module.exports = linearRegression;

},{}],18:[function(require,module,exports){
'use strict';

/**
 * Given the output of `linearRegression`: an object
 * with `m` and `b` values indicating slope and intercept,
 * respectively, generate a line function that translates
 * x values into y values.
 *
 * @param {Object} mb object with `m` and `b` members, representing
 * slope and intersect of desired line
 * @returns {Function} method that computes y-value at any given
 * x-value on the line.
 * @example
 * var l = linearRegressionLine(linearRegression([[0, 0], [1, 1]]));
 * l(0) //= 0
 * l(2) //= 2
 */
function linearRegressionLine(mb) {
    // Return a function that computes a `y` value for each
    // x value it is given, based on the values of `b` and `a`
    // that we just computed.
    return function(x) {
        return mb.b + (mb.m * x);
    };
}

module.exports = linearRegressionLine;

},{}],19:[function(require,module,exports){
'use strict';

var median = require('./median');

/**
 * The [Median Absolute Deviation](http://en.wikipedia.org/wiki/Median_absolute_deviation) is
 * a robust measure of statistical
 * dispersion. It is more resilient to outliers than the standard deviation.
 *
 * @param {Array<number>} x input array
 * @returns {number} median absolute deviation
 * @example
 * mad([1, 1, 2, 2, 4, 6, 9]); //= 1
 */
function mad(x) {
    // The mad of nothing is null
    if (!x || x.length === 0) { return null; }

    var medianValue = median(x),
        medianAbsoluteDeviations = [];

    // Make a list of absolute deviations from the median
    for (var i = 0; i < x.length; i++) {
        medianAbsoluteDeviations.push(Math.abs(x[i] - medianValue));
    }

    // Find the median value of that list
    return median(medianAbsoluteDeviations);
}

module.exports = mad;

},{"./median":22}],20:[function(require,module,exports){
'use strict';

/**
 * This computes the maximum number in an array.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} maximum value
 * @example
 * console.log(max([1, 2, 3, 4])); // 4
 */
function max(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, max is
        // undefined and is thus made the maximum element in the array
        if (x[i] > value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}

module.exports = max;

},{}],21:[function(require,module,exports){
'use strict';

var sum = require('./sum');

/**
 * The mean, _also known as average_,
 * is the sum of all values over the number of values.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input values
 * @returns {number} mean
 * @example
 * console.log(mean([0, 10])); // 5
 */
function mean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    return sum(x) / x.length;
}

module.exports = mean;

},{"./sum":45}],22:[function(require,module,exports){
'use strict';

var numericSort = require('./numeric_sort');

/**
 * The [median](http://en.wikipedia.org/wiki/Median) is
 * the middle number of a list. This is often a good indicator of 'the middle'
 * when there are outliers that skew the `mean()` value.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * The median isn't necessarily one of the elements in the list: the value
 * can be the average of two elements if the list has an even length
 * and the two central values are different.
 *
 * @param {Array<number>} x input
 * @returns {number} median value
 * @example
 * var incomes = [10, 2, 5, 100, 2, 1];
 * median(incomes); //= 3.5
 */
function median(x) {
    // The median of an empty list is null
    if (x.length === 0) { return null; }

    // Sorting the array makes it easy to find the center, but
    // use `.slice()` to ensure the original array `x` is not modified
    var sorted = numericSort(x);

    // If the length of the list is odd, it's the central number
    if (sorted.length % 2 === 1) {
        return sorted[(sorted.length - 1) / 2];
    // Otherwise, the median is the average of the two numbers
    // at the center of the list
    } else {
        var a = sorted[(sorted.length / 2) - 1];
        var b = sorted[(sorted.length / 2)];
        return (a + b) / 2;
    }
}

module.exports = median;

},{"./numeric_sort":26}],23:[function(require,module,exports){
'use strict';

/**
 * The min is the lowest number in the array. This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} minimum value
 * @example
 * min([1, 5, -10, 100, 2]); // -100
 */
function min(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, min is
        // undefined and is thus made the minimum element in the array
        if (x[i] < value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}

module.exports = min;

},{}],24:[function(require,module,exports){
'use strict';

/**
 * **Mixin** simple_statistics to a single Array instance if provided
 * or the Array native object if not. This is an optional
 * feature that lets you treat simple_statistics as a native feature
 * of Javascript.
 *
 * @param {Object} ss simple statistics
 * @param {Array} [array=] a single array instance which will be augmented
 * with the extra methods. If omitted, mixin will apply to all arrays
 * by changing the global `Array.prototype`.
 * @returns {*} the extended Array, or Array.prototype if no object
 * is given.
 *
 * @example
 * var myNumbers = [1, 2, 3];
 * mixin(ss, myNumbers);
 * console.log(myNumbers.sum()); // 6
 */
function mixin(ss, array) {
    var support = !!(Object.defineProperty && Object.defineProperties);
    // Coverage testing will never test this error.
    /* istanbul ignore next */
    if (!support) {
        throw new Error('without defineProperty, simple-statistics cannot be mixed in');
    }

    // only methods which work on basic arrays in a single step
    // are supported
    var arrayMethods = ['median', 'standardDeviation', 'sum',
        'sampleSkewness',
        'mean', 'min', 'max', 'quantile', 'geometricMean',
        'harmonicMean', 'root_mean_square'];

    // create a closure with a method name so that a reference
    // like `arrayMethods[i]` doesn't follow the loop increment
    function wrap(method) {
        return function() {
            // cast any arguments into an array, since they're
            // natively objects
            var args = Array.prototype.slice.apply(arguments);
            // make the first argument the array itself
            args.unshift(this);
            // return the result of the ss method
            return ss[method].apply(ss, args);
        };
    }

    // select object to extend
    var extending;
    if (array) {
        // create a shallow copy of the array so that our internal
        // operations do not change it by reference
        extending = array.slice();
    } else {
        extending = Array.prototype;
    }

    // for each array function, define a function that gets
    // the array as the first argument.
    // We use [defineProperty](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty)
    // because it allows these properties to be non-enumerable:
    // `for (var in x)` loops will not run into problems with this
    // implementation.
    for (var i = 0; i < arrayMethods.length; i++) {
        Object.defineProperty(extending, arrayMethods[i], {
            value: wrap(arrayMethods[i]),
            configurable: true,
            enumerable: false,
            writable: true
        });
    }

    return extending;
}

module.exports = mixin;

},{}],25:[function(require,module,exports){
'use strict';

var numericSort = require('./numeric_sort');

/**
 * The [mode](http://bit.ly/W5K4Yt) is the number that appears in a list the highest number of times.
 * There can be multiple modes in a list: in the event of a tie, this
 * algorithm will return the most recently seen mode.
 *
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array.
 *
 * @param {Array<number>} x input
 * @returns {number} mode
 * @example
 * mode([0, 0, 1]); //= 0
 */
function mode(x) {

    // Handle edge cases:
    // The median of an empty list is null
    if (x.length === 0) { return null; }
    else if (x.length === 1) { return x[0]; }

    // Sorting the array lets us iterate through it below and be sure
    // that every time we see a new number it's new and we'll never
    // see the same number twice
    var sorted = numericSort(x);

    // This assumes it is dealing with an array of size > 1, since size
    // 0 and 1 are handled immediately. Hence it starts at index 1 in the
    // array.
    var last = sorted[0],
        // store the mode as we find new modes
        value,
        // store how many times we've seen the mode
        maxSeen = 0,
        // how many times the current candidate for the mode
        // has been seen
        seenThis = 1;

    // end at sorted.length + 1 to fix the case in which the mode is
    // the highest number that occurs in the sequence. the last iteration
    // compares sorted[i], which is undefined, to the highest number
    // in the series
    for (var i = 1; i < sorted.length + 1; i++) {
        // we're seeing a new number pass by
        if (sorted[i] !== last) {
            // the last number is the new mode since we saw it more
            // often than the old one
            if (seenThis > maxSeen) {
                maxSeen = seenThis;
                value = last;
            }
            seenThis = 1;
            last = sorted[i];
        // if this isn't a new number, it's one more occurrence of
        // the potential mode
        } else { seenThis++; }
    }
    return value;
}

module.exports = mode;

},{"./numeric_sort":26}],26:[function(require,module,exports){
'use strict';

/**
 * Sort an array of numbers by their numeric value, ensuring that the
 * array is not changed in place.
 *
 * This is necessary because the default behavior of .sort
 * in JavaScript is to sort arrays as string values
 *
 *     [1, 10, 12, 102, 20].sort()
 *     // output
 *     [1, 10, 102, 12, 20]
 *
 * @param {Array<number>} array input array
 * @return {Array<number>} sorted array
 * @example
 * numericSort([3, 2, 1]) // [1, 2, 3]
 */
function numericSort(array) {
    return array
        // ensure the array is changed in-place
        .slice()
        // comparator function that treats input as numeric
        .sort(function(a, b) {
            return a - b;
        });
}

module.exports = numericSort;

},{}],27:[function(require,module,exports){
'use strict';

/**
 * This is a single-layer [Perceptron Classifier](http://en.wikipedia.org/wiki/Perceptron) that takes
 * arrays of numbers and predicts whether they should be classified
 * as either 0 or 1 (negative or positive examples).
 * @class
 * @example
 * // Create the model
 * var p = new PerceptronModel();
 * // Train the model with input with a diagonal boundary.
 * for (var i = 0; i < 5; i++) {
 *     p.train([1, 1], 1);
 *     p.train([0, 1], 0);
 *     p.train([1, 0], 0);
 *     p.train([0, 0], 0);
 * }
 * p.predict([0, 0]); // 0
 * p.predict([0, 1]); // 0
 * p.predict([1, 0]); // 0
 * p.predict([1, 1]); // 1
 */
function PerceptronModel() {
    // The weights, or coefficients of the model;
    // weights are only populated when training with data.
    this.weights = [];
    // The bias term, or intercept; it is also a weight but
    // it's stored separately for convenience as it is always
    // multiplied by one.
    this.bias = 0;
}

/**
 * **Predict**: Use an array of features with the weight array and bias
 * to predict whether an example is labeled 0 or 1.
 *
 * @param {Array<number>} features an array of features as numbers
 * @returns {number} 1 if the score is over 0, otherwise 0
 */
PerceptronModel.prototype.predict = function(features) {

    // Only predict if previously trained
    // on the same size feature array(s).
    if (features.length !== this.weights.length) { return null; }

    // Calculate the sum of features times weights,
    // with the bias added (implicitly times one).
    var score = 0;
    for (var i = 0; i < this.weights.length; i++) {
        score += this.weights[i] * features[i];
    }
    score += this.bias;

    // Classify as 1 if the score is over 0, otherwise 0.
    if (score > 0) {
      return 1;
    } else {
      return 0;
    }
};

/**
 * **Train** the classifier with a new example, which is
 * a numeric array of features and a 0 or 1 label.
 *
 * @param {Array<number>} features an array of features as numbers
 * @param {number} label either 0 or 1
 * @returns {PerceptronModel} this
 */
PerceptronModel.prototype.train = function(features, label) {
    // Require that only labels of 0 or 1 are considered.
    if (label !== 0 && label !== 1) { return null; }
    // The length of the feature array determines
    // the length of the weight array.
    // The perceptron will continue learning as long as
    // it keeps seeing feature arrays of the same length.
    // When it sees a new data shape, it initializes.
    if (features.length !== this.weights.length) {
        this.weights = features;
        this.bias = 1;
    }
    // Make a prediction based on current weights.
    var prediction = this.predict(features);
    // Update the weights if the prediction is wrong.
    if (prediction !== label) {
        var gradient = label - prediction;
        for (var i = 0; i < this.weights.length; i++) {
            this.weights[i] += gradient * features[i];
        }
        this.bias += gradient;
    }
    return this;
};

module.exports = PerceptronModel;

},{}],28:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var factorial = require('./factorial');

/**
 * The [Poisson Distribution](http://en.wikipedia.org/wiki/Poisson_distribution)
 * is a discrete probability distribution that expresses the probability
 * of a given number of events occurring in a fixed interval of time
 * and/or space if these events occur with a known average rate and
 * independently of the time since the last event.
 *
 * The Poisson Distribution is characterized by the strictly positive
 * mean arrival or occurrence rate, `λ`.
 *
 * @param {number} lambda location poisson distribution
 * @returns {number} value of poisson distribution at that point
 */
function poissonDistribution(lambda) {
    // Check that lambda is strictly positive
    if (lambda <= 0) { return null; }

    // our current place in the distribution
    var x = 0,
        // and we keep track of the current cumulative probability, in
        // order to know when to stop calculating chances.
        cumulativeProbability = 0,
        // the calculated cells to be returned
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = (Math.pow(Math.E, -lambda) * Math.pow(lambda, x)) / factorial(x);
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = poissonDistribution;

},{"./epsilon":10,"./factorial":12}],29:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var inverseErrorFunction = require('./inverse_error_function');

/**
 * The [Probit](http://en.wikipedia.org/wiki/Probit)
 * is the inverse of cumulativeStdNormalProbability(),
 * and is also known as the normal quantile function.
 *
 * It returns the number of standard deviations from the mean
 * where the p'th quantile of values can be found in a normal distribution.
 * So, for example, probit(0.5 + 0.6827/2) ≈ 1 because 68.27% of values are
 * normally found within 1 standard deviation above or below the mean.
 *
 * @param {number} p
 * @returns {number} probit
 */
function probit(p) {
    if (p === 0) {
        p = epsilon;
    } else if (p >= 1) {
        p = 1 - epsilon;
    }
    return Math.sqrt(2) * inverseErrorFunction(2 * p - 1);
}

module.exports = probit;

},{"./epsilon":10,"./inverse_error_function":16}],30:[function(require,module,exports){
'use strict';

var quantileSorted = require('./quantile_sorted');
var numericSort = require('./numeric_sort');

/**
 * The [quantile](https://en.wikipedia.org/wiki/Quantile):
 * this is a population quantile, since we assume to know the entire
 * dataset in this library. This is an implementation of the
 * [Quantiles of a Population](http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population)
 * algorithm from wikipedia.
 *
 * Sample is a one-dimensional array of numbers,
 * and p is either a decimal number from 0 to 1 or an array of decimal
 * numbers from 0 to 1.
 * In terms of a k/q quantile, p = k/q - it's just dealing with fractions or dealing
 * with decimal values.
 * When p is an array, the result of the function is also an array containing the appropriate
 * quantiles in input order
 *
 * @param {Array<number>} sample a sample from the population
 * @param {number} p the desired quantile, as a number between 0 and 1
 * @returns {number} quantile
 * @example
 * var data = [3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20];
 * quantile(data, 1); //= max(data);
 * quantile(data, 0); //= min(data);
 * quantile(data, 0.5); //= 9
 */
function quantile(sample, p) {

    // We can't derive quantiles from an empty list
    if (sample.length === 0) { return null; }

    // Sort a copy of the array. We'll need a sorted array to index
    // the values in sorted order.
    var sorted = numericSort(sample);

    if (p.length) {
        // Initialize the result array
        var results = [];
        // For each requested quantile
        for (var i = 0; i < p.length; i++) {
            results[i] = quantileSorted(sorted, p[i]);
        }
        return results;
    } else {
        return quantileSorted(sorted, p);
    }
}

module.exports = quantile;

},{"./numeric_sort":26,"./quantile_sorted":31}],31:[function(require,module,exports){
'use strict';

/**
 * This is the internal implementation of quantiles: when you know
 * that the order is sorted, you don't need to re-sort it, and the computations
 * are faster.
 *
 * @param {Array<number>} sample input data
 * @param {number} p desired quantile: a number between 0 to 1, inclusive
 * @returns {number} quantile value
 * @example
 * var data = [3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20];
 * quantileSorted(data, 1); //= max(data);
 * quantileSorted(data, 0); //= min(data);
 * quantileSorted(data, 0.5); //= 9
 */
function quantileSorted(sample, p) {
    var idx = (sample.length) * p;
    if (p < 0 || p > 1) {
        return null;
    } else if (p === 1) {
        // If p is 1, directly return the last element
        return sample[sample.length - 1];
    } else if (p === 0) {
        // If p is 0, directly return the first element
        return sample[0];
    } else if (idx % 1 !== 0) {
        // If p is not integer, return the next element in array
        return sample[Math.ceil(idx) - 1];
    } else if (sample.length % 2 === 0) {
        // If the list has even-length, we'll take the average of this number
        // and the next value, if there is one
        return (sample[idx - 1] + sample[idx]) / 2;
    } else {
        // Finally, in the simple case of an integer value
        // with an odd-length list, return the sample value at the index.
        return sample[idx];
    }
}

module.exports = quantileSorted;

},{}],32:[function(require,module,exports){
'use strict';

/**
 * The [R Squared](http://en.wikipedia.org/wiki/Coefficient_of_determination)
 * value of data compared with a function `f`
 * is the sum of the squared differences between the prediction
 * and the actual value.
 *
 * @param {Array<Array<number>>} data input data: this should be doubly-nested
 * @param {Function} func function called on `[i][0]` values within the dataset
 * @returns {number} r-squared value
 * @example
 * var samples = [[0, 0], [1, 1]];
 * var regressionLine = linearRegressionLine(linearRegression(samples));
 * rSquared(samples, regressionLine); //= 1 this line is a perfect fit
 */
function rSquared(data, func) {
    if (data.length < 2) { return 1; }

    // Compute the average y value for the actual
    // data set in order to compute the
    // _total sum of squares_
    var sum = 0, average;
    for (var i = 0; i < data.length; i++) {
        sum += data[i][1];
    }
    average = sum / data.length;

    // Compute the total sum of squares - the
    // squared difference between each point
    // and the average of all points.
    var sumOfSquares = 0;
    for (var j = 0; j < data.length; j++) {
        sumOfSquares += Math.pow(average - data[j][1], 2);
    }

    // Finally estimate the error: the squared
    // difference between the estimate and the actual data
    // value at each point.
    var err = 0;
    for (var k = 0; k < data.length; k++) {
        err += Math.pow(data[k][1] - func(data[k][0]), 2);
    }

    // As the error grows larger, its ratio to the
    // sum of squares increases and the r squared
    // value grows lower.
    return 1 - (err / sumOfSquares);
}

module.exports = rSquared;

},{}],33:[function(require,module,exports){
'use strict';

/**
 * The Root Mean Square (RMS) is
 * a mean function used as a measure of the magnitude of a set
 * of numbers, regardless of their sign.
 * This is the square root of the mean of the squares of the
 * input numbers.
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} root mean square
 * @example
 * rootMeanSquare([-1, 1, -1, 1]); //= 1
 */
function rootMeanSquare(x) {
    if (x.length === 0) { return null; }

    var sumOfSquares = 0;
    for (var i = 0; i < x.length; i++) {
        sumOfSquares += Math.pow(x[i], 2);
    }

    return Math.sqrt(sumOfSquares / x.length);
}

module.exports = rootMeanSquare;

},{}],34:[function(require,module,exports){
'use strict';

var shuffle = require('./shuffle');

/**
 * Create a [simple random sample](http://en.wikipedia.org/wiki/Simple_random_sample)
 * from a given array of `n` elements.
 *
 * The sampled values will be in any order, not necessarily the order
 * they appear in the input.
 *
 * @param {Array} array input array. can contain any type
 * @param {number} n count of how many elements to take
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * instead of Math.random
 * @return {Array} subset of n elements in original array
 * @example
 * var values = [1, 2, 4, 5, 6, 7, 8, 9];
 * sample(values, 3); // returns 3 random values, like [2, 5, 8];
 */
function sample(array, n, randomSource) {
    // shuffle the original array using a fisher-yates shuffle
    var shuffled = shuffle(array, randomSource);

    // and then return a subset of it - the first `n` elements.
    return shuffled.slice(0, n);
}

module.exports = sample;

},{"./shuffle":40}],35:[function(require,module,exports){
'use strict';

var sampleCovariance = require('./sample_covariance');
var sampleStandardDeviation = require('./sample_standard_deviation');

/**
 * The [correlation](http://en.wikipedia.org/wiki/Correlation_and_dependence) is
 * a measure of how correlated two datasets are, between -1 and 1
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample correlation
 * @example
 * var a = [1, 2, 3, 4, 5, 6];
 * var b = [2, 2, 3, 4, 5, 60];
 * sampleCorrelation(a, b); //= 0.691
 */
function sampleCorrelation(x, y) {
    var cov = sampleCovariance(x, y),
        xstd = sampleStandardDeviation(x),
        ystd = sampleStandardDeviation(y);

    if (cov === null || xstd === null || ystd === null) {
        return null;
    }

    return cov / xstd / ystd;
}

module.exports = sampleCorrelation;

},{"./sample_covariance":36,"./sample_standard_deviation":38}],36:[function(require,module,exports){
'use strict';

var mean = require('./mean');

/**
 * [Sample covariance](https://en.wikipedia.org/wiki/Sample_mean_and_sampleCovariance) of two datasets:
 * how much do the two datasets move together?
 * x and y are two datasets, represented as arrays of numbers.
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample covariance
 * @example
 * var x = [1, 2, 3, 4, 5, 6];
 * var y = [6, 5, 4, 3, 2, 1];
 * sampleCovariance(x, y); //= -3.5
 */
function sampleCovariance(x, y) {

    // The two datasets must have the same length which must be more than 1
    if (x.length <= 1 || x.length !== y.length) {
        return null;
    }

    // determine the mean of each dataset so that we can judge each
    // value of the dataset fairly as the difference from the mean. this
    // way, if one dataset is [1, 2, 3] and [2, 3, 4], their covariance
    // does not suffer because of the difference in absolute values
    var xmean = mean(x),
        ymean = mean(y),
        sum = 0;

    // for each pair of values, the covariance increases when their
    // difference from the mean is associated - if both are well above
    // or if both are well below
    // the mean, the covariance increases significantly.
    for (var i = 0; i < x.length; i++) {
        sum += (x[i] - xmean) * (y[i] - ymean);
    }

    // this is Bessels' Correction: an adjustment made to sample statistics
    // that allows for the reduced degree of freedom entailed in calculating
    // values from samples rather than complete populations.
    var besselsCorrection = x.length - 1;

    // the covariance is weighted by the length of the datasets.
    return sum / besselsCorrection;
}

module.exports = sampleCovariance;

},{"./mean":21}],37:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');
var sampleStandardDeviation = require('./sample_standard_deviation');

/**
 * [Skewness](http://en.wikipedia.org/wiki/Skewness) is
 * a measure of the extent to which a probability distribution of a
 * real-valued random variable "leans" to one side of the mean.
 * The skewness value can be positive or negative, or even undefined.
 *
 * Implementation is based on the adjusted Fisher-Pearson standardized
 * moment coefficient, which is the version found in Excel and several
 * statistical packages including Minitab, SAS and SPSS.
 *
 * @param {Array<number>} x input
 * @returns {number} sample skewness
 * @example
 * var data = [2, 4, 6, 3, 1];
 * sampleSkewness(data); //= 0.5901286564
 */
function sampleSkewness(x) {
    // The skewness of less than three arguments is null
    if (x.length < 3) { return null; }

    var n = x.length,
        cubedS = Math.pow(sampleStandardDeviation(x), 3),
        sumCubedDeviations = sumNthPowerDeviations(x, 3);

    return n * sumCubedDeviations / ((n - 1) * (n - 2) * cubedS);
}

module.exports = sampleSkewness;

},{"./sample_standard_deviation":38,"./sum_nth_power_deviations":46}],38:[function(require,module,exports){
'use strict';

var sampleVariance = require('./sample_variance');

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance.
 *
 * @param {Array<number>} x input array
 * @returns {number} sample standard deviation
 * @example
 * ss.sampleStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
 * //= 2.138
 */
function sampleStandardDeviation(x) {
    // The standard deviation of no numbers is null
    if (x.length <= 1) { return null; }

    return Math.sqrt(sampleVariance(x));
}

module.exports = sampleStandardDeviation;

},{"./sample_variance":39}],39:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');

/*
 * The [sample variance](https://en.wikipedia.org/wiki/Variance#Sample_variance)
 * is the sum of squared deviations from the mean. The sample variance
 * is distinguished from the variance by the usage of [Bessel's Correction](https://en.wikipedia.org/wiki/Bessel's_correction):
 * instead of dividing the sum of squared deviations by the length of the input,
 * it is divided by the length minus one. This corrects the bias in estimating
 * a value from a set that you don't know if full.
 *
 * References:
 * * [Wolfram MathWorld on Sample Variance](http://mathworld.wolfram.com/SampleVariance.html)
 *
 * @param {Array<number>} x input array
 * @return {number} sample variance
 * @example
 * sampleVariance([1, 2, 3, 4, 5]); //= 2.5
 */
function sampleVariance(x) {
    // The variance of no numbers is null
    if (x.length <= 1) { return null; }

    var sumSquaredDeviationsValue = sumNthPowerDeviations(x, 2);

    // this is Bessels' Correction: an adjustment made to sample statistics
    // that allows for the reduced degree of freedom entailed in calculating
    // values from samples rather than complete populations.
    var besselsCorrection = x.length - 1;

    // Find the mean value of that list
    return sumSquaredDeviationsValue / besselsCorrection;
}

module.exports = sampleVariance;

},{"./sum_nth_power_deviations":46}],40:[function(require,module,exports){
'use strict';

var shuffleInPlace = require('./shuffle_in_place');

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * is a fast way to create a random permutation of a finite set. This is
 * a function around `shuffle_in_place` that adds the guarantee that
 * it will not modify its input.
 *
 * @param {Array} sample an array of any kind of element
 * @param {Function} [randomSource=Math.random] an optional entropy source
 * @return {Array} shuffled version of input
 * @example
 * var shuffled = shuffle([1, 2, 3, 4]);
 * shuffled; // = [2, 3, 1, 4] or any other random permutation
 */
function shuffle(sample, randomSource) {
    // slice the original array so that it is not modified
    sample = sample.slice();

    // and then shuffle that shallow-copied array, in place
    return shuffleInPlace(sample.slice(), randomSource);
}

module.exports = shuffle;

},{"./shuffle_in_place":41}],41:[function(require,module,exports){
'use strict';

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * in-place - which means that it **will change the order of the original
 * array by reference**.
 *
 * This is an algorithm that generates a random [permutation](https://en.wikipedia.org/wiki/Permutation)
 * of a set.
 *
 * @param {Array} sample input array
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * @returns {Array} sample
 * @example
 * var sample = [1, 2, 3, 4];
 * shuffleInPlace(sample);
 * // sample is shuffled to a value like [2, 1, 4, 3]
 */
function shuffleInPlace(sample, randomSource) {

    // a custom random number source can be provided if you want to use
    // a fixed seed or another random number generator, like
    // [random-js](https://www.npmjs.org/package/random-js)
    randomSource = randomSource || Math.random;

    // store the current length of the sample to determine
    // when no elements remain to shuffle.
    var length = sample.length;

    // temporary is used to hold an item when it is being
    // swapped between indices.
    var temporary;

    // The index to swap at each stage.
    var index;

    // While there are still items to shuffle
    while (length > 0) {
        // chose a random index within the subset of the array
        // that is not yet shuffled
        index = Math.floor(randomSource() * length--);

        // store the value that we'll move temporarily
        temporary = sample[length];

        // swap the value at `sample[length]` with `sample[index]`
        sample[length] = sample[index];
        sample[index] = temporary;
    }

    return sample;
}

module.exports = shuffleInPlace;

},{}],42:[function(require,module,exports){
'use strict';

/**
 * For a sorted input, counting the number of unique values
 * is possible in constant time and constant memory. This is
 * a simple implementation of the algorithm.
 *
 * Values are compared with `===`, so objects and non-primitive objects
 * are not handled in any special way.
 *
 * @param {Array} input an array of primitive values.
 * @returns {number} count of unique values
 * @example
 * sortedUniqueCount([1, 2, 3]); // 3
 * sortedUniqueCount([1, 1, 1]); // 1
 */
function sortedUniqueCount(input) {
    var uniqueValueCount = 0,
        lastSeenValue;
    for (var i = 0; i < input.length; i++) {
        if (i === 0 || input[i] !== lastSeenValue) {
            lastSeenValue = input[i];
            uniqueValueCount++;
        }
    }
    return uniqueValueCount;
}

module.exports = sortedUniqueCount;

},{}],43:[function(require,module,exports){
'use strict';

var variance = require('./variance');

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance. It's useful for measuring the amount
 * of variation or dispersion in a set of values.
 *
 * Standard deviation is only appropriate for full-population knowledge: for
 * samples of a population, {@link sampleStandardDeviation} is
 * more appropriate.
 *
 * @param {Array<number>} x input
 * @returns {number} standard deviation
 * @example
 * var scores = [2, 4, 4, 4, 5, 5, 7, 9];
 * variance(scores); //= 4
 * standardDeviation(scores); //= 2
 */
function standardDeviation(x) {
    // The standard deviation of no numbers is null
    if (x.length === 0) { return null; }

    return Math.sqrt(variance(x));
}

module.exports = standardDeviation;

},{"./variance":49}],44:[function(require,module,exports){
'use strict';

var SQRT_2PI = Math.sqrt(2 * Math.PI);

function cumulativeDistribution(z) {
    var sum = z,
        tmp = z;

    // 15 iterations are enough for 4-digit precision
    for (var i = 1; i < 15; i++) {
        tmp *= z * z / (2 * i + 1);
        sum += tmp;
    }
    return Math.round((0.5 + (sum / SQRT_2PI) * Math.exp(-z * z / 2)) * 1e4) / 1e4;
}

/**
 * A standard normal table, also called the unit normal table or Z table,
 * is a mathematical table for the values of Φ (phi), which are the values of
 * the cumulative distribution function of the normal distribution.
 * It is used to find the probability that a statistic is observed below,
 * above, or between values on the standard normal distribution, and by
 * extension, any normal distribution.
 *
 * The probabilities are calculated using the
 * [Cumulative distribution function](https://en.wikipedia.org/wiki/Normal_distribution#Cumulative_distribution_function).
 * The table used is the cumulative, and not cumulative from 0 to mean
 * (even though the latter has 5 digits precision, instead of 4).
 */
var standardNormalTable = [];

for (var z = 0; z <= 3.09; z += 0.01) {
    standardNormalTable.push(cumulativeDistribution(z));
}

module.exports = standardNormalTable;

},{}],45:[function(require,module,exports){
'use strict';

/**
 * The [sum](https://en.wikipedia.org/wiki/Summation) of an array
 * is the result of adding all numbers together, starting from zero.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @return {number} sum of all input numbers
 * @example
 * console.log(sum([1, 2, 3])); // 6
 */
function sum(x) {
    var value = 0;
    for (var i = 0; i < x.length; i++) {
        value += x[i];
    }
    return value;
}

module.exports = sum;

},{}],46:[function(require,module,exports){
'use strict';

var mean = require('./mean');

/**
 * The sum of deviations to the Nth power.
 * When n=2 it's the sum of squared deviations.
 * When n=3 it's the sum of cubed deviations.
 *
 * @param {Array<number>} x
 * @param {number} n power
 * @returns {number} sum of nth power deviations
 * @example
 * var input = [1, 2, 3];
 * // since the variance of a set is the mean squared
 * // deviations, we can calculate that with sumNthPowerDeviations:
 * var variance = sumNthPowerDeviations(input) / input.length;
 */
function sumNthPowerDeviations(x, n) {
    var meanValue = mean(x),
        sum = 0;

    for (var i = 0; i < x.length; i++) {
        sum += Math.pow(x[i] - meanValue, n);
    }

    return sum;
}

module.exports = sumNthPowerDeviations;

},{"./mean":21}],47:[function(require,module,exports){
'use strict';

var standardDeviation = require('./standard_deviation');
var mean = require('./mean');

/**
 * This is to compute [a one-sample t-test](https://en.wikipedia.org/wiki/Student%27s_t-test#One-sample_t-test), comparing the mean
 * of a sample to a known value, x.
 *
 * in this case, we're trying to determine whether the
 * population mean is equal to the value that we know, which is `x`
 * here. usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * @param {Array<number>} sample an array of numbers as input
 * @param {number} x expected vale of the population mean
 * @returns {number} value
 * @example
 * tTest([1, 2, 3, 4, 5, 6], 3.385); //= 0.16494154
 */
function tTest(sample, x) {
    // The mean of the sample
    var sampleMean = mean(sample);

    // The standard deviation of the sample
    var sd = standardDeviation(sample);

    // Square root the length of the sample
    var rootN = Math.sqrt(sample.length);

    // Compute the known value against the sample,
    // returning the t value
    return (sampleMean - x) / (sd / rootN);
}

module.exports = tTest;

},{"./mean":21,"./standard_deviation":43}],48:[function(require,module,exports){
'use strict';

var mean = require('./mean');
var sampleVariance = require('./sample_variance');

/**
 * This is to compute [two sample t-test](http://en.wikipedia.org/wiki/Student's_t-test).
 * Tests whether "mean(X)-mean(Y) = difference", (
 * in the most common case, we often have `difference == 0` to test if two samples
 * are likely to be taken from populations with the same mean value) with
 * no prior knowledge on standard deviations of both samples
 * other than the fact that they have the same standard deviation.
 *
 * Usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * `diff` can be omitted if it equals 0.
 *
 * [This is used to confirm or deny](http://www.monarchlab.org/Lab/Research/Stats/2SampleT.aspx)
 * a null hypothesis that the two populations that have been sampled into
 * `sampleX` and `sampleY` are equal to each other.
 *
 * @param {Array<number>} sampleX a sample as an array of numbers
 * @param {Array<number>} sampleY a sample as an array of numbers
 * @param {number} [difference=0]
 * @returns {number} test result
 * @example
 * ss.tTestTwoSample([1, 2, 3, 4], [3, 4, 5, 6], 0); //= -2.1908902300206643
 */
function tTestTwoSample(sampleX, sampleY, difference) {
    var n = sampleX.length,
        m = sampleY.length;

    // If either sample doesn't actually have any values, we can't
    // compute this at all, so we return `null`.
    if (!n || !m) { return null; }

    // default difference (mu) is zero
    if (!difference) {
        difference = 0;
    }

    var meanX = mean(sampleX),
        meanY = mean(sampleY);

    var weightedVariance = ((n - 1) * sampleVariance(sampleX) +
        (m - 1) * sampleVariance(sampleY)) / (n + m - 2);

    return (meanX - meanY - difference) /
        Math.sqrt(weightedVariance * (1 / n + 1 / m));
}

module.exports = tTestTwoSample;

},{"./mean":21,"./sample_variance":39}],49:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');

/**
 * The [variance](http://en.wikipedia.org/wiki/Variance)
 * is the sum of squared deviations from the mean.
 *
 * This is an implementation of variance, not sample variance:
 * see the `sampleVariance` method if you want a sample measure.
 *
 * @param {Array<number>} x a population
 * @returns {number} variance: a value greater than or equal to zero.
 * zero indicates that all values are identical.
 * @example
 * ss.variance([1, 2, 3, 4, 5, 6]); //= 2.917
 */
function variance(x) {
    // The variance of no numbers is null
    if (x.length === 0) { return null; }

    // Find the mean of squared deviations between the
    // mean value and each value.
    return sumNthPowerDeviations(x, 2) / x.length;
}

module.exports = variance;

},{"./sum_nth_power_deviations":46}],50:[function(require,module,exports){
'use strict';

/**
 * The [Z-Score, or Standard Score](http://en.wikipedia.org/wiki/Standard_score).
 *
 * The standard score is the number of standard deviations an observation
 * or datum is above or below the mean. Thus, a positive standard score
 * represents a datum above the mean, while a negative standard score
 * represents a datum below the mean. It is a dimensionless quantity
 * obtained by subtracting the population mean from an individual raw
 * score and then dividing the difference by the population standard
 * deviation.
 *
 * The z-score is only defined if one knows the population parameters;
 * if one only has a sample set, then the analogous computation with
 * sample mean and sample standard deviation yields the
 * Student's t-statistic.
 *
 * @param {number} x
 * @param {number} mean
 * @param {number} standardDeviation
 * @return {number} z score
 * @example
 * ss.zScore(78, 80, 5); //= -0.4
 */
function zScore(x, mean, standardDeviation) {
    return (x - mean) / standardDeviation;
}

module.exports = zScore;

},{}]},{},[1])(1)
});
// index.html
//<!DOCTYPE html>
//<meta charset="utf-8">
//<style>
//body {
//  font:normal 14px sans-serif;
//}
#form {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: hsla(0, 100%, 100%, 0.8);
}
input {
  margin-right: 10px;
}
.states {
  fill: none;
  stroke: #fff;
  stroke-linejoin: round;
}
path {
  -webkit-transition: fill 200ms linear;
}
.q0-9 { fill:rgb(247,251,255); }
.q1-9 { fill:rgb(222,235,247); }
.q2-9 { fill:rgb(198,219,239); }
.q3-9 { fill:rgb(158,202,225); }
.q4-9 { fill:rgb(107,174,214); }
.q5-9 { fill:rgb(66,146,198); }
.q6-9 { fill:rgb(33,113,181); }
.q7-9 { fill:rgb(8,81,156); }
.q8-9 { fill:rgb(8,48,107); }
</style>
<body>
<div id='form'>
  <input checked='true' type='radio' name='scale' id='jenks9' /><label for='jenks9'>Jenks from SS v0.9</label>
  <input type='radio' name='scale' id='ckmeans' /><label for='ckmeans'>New ckmeans in SS v1.0</label>
  <input type='radio' name='scale' id='quantize' /><label for='quantize'>Quantize</label>
</div>
<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="simple_statistics.js"></script>
<script src="ckmeans_simple_statistics.js"></script>
<script src="http://d3js.org/queue.v1.min.js"></script>
<script src="http://d3js.org/topojson.v0.min.js"></script>
<script>
var width = 960,
    height = 500;
var scales = {};
scales.quantize = d3.scale.quantize()
    .domain([0, .15])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
var path = d3.geo.path();
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
queue()
    .defer(d3.json, "/d/4090846/us.json")
    .defer(d3.tsv, "unemployment.tsv")
    .await(ready);
function ready(error, us, unemployment) {
  var rateById = {};
  unemployment.forEach(function(d) { rateById[d.id] = +d.rate; });
  scales.jenks9 = d3.scale.threshold()
      .domain(ss.jenks(unemployment.map(function(d) { return +d.rate; }), 9))
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
  
  scales.ckmeans = d3.scale.threshold()
      .domain(ssck.ckmeans(unemployment.map(function(d) { return +d.rate; }), 9).map(function(cluster) {return cluster[0];}))
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
  var counties = svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.object(us, us.objects.counties).geometries)
    .enter().append("path")
      .attr("d", path);
  d3.selectAll('input').on('change', function() {
      setScale(this.id);
  });
  function setScale(s) {
      counties.attr("class", function(d) { return scales[s](rateById[d.id]); })
  }
  setScale('jenks9');
  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
      .attr("class", "states")
      .attr("d", path);
}
</script>
 simple_statistics.js
// # simple-statistics
//
// A simple, literate statistics system. The code below uses the
// [Javascript module pattern](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth),
// eventually assigning `simple-statistics` to `ss` in browsers or the
// `exports object for node.js
(function() {
    var ss = {};

    if (typeof module !== 'undefined') {
        // Assign the `ss` object to exports, so that you can require
        // it in [node.js](http://nodejs.org/)
        exports = module.exports = ss;
    } else {
        // Otherwise, in a browser, we assign `ss` to the window object,
        // so you can simply refer to it as `ss`.
        this.ss = ss;
    }

    // # [Linear Regression](http://en.wikipedia.org/wiki/Linear_regression)
    //
    // [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
    // is a simple way to find a fitted line
    // between a set of coordinates.
    ss.linear_regression = function() {
        var linreg = {},
            data = [];

        // Assign data to the model. Data is assumed to be an array.
        linreg.data = function(x) {
            if (!arguments.length) return data;
            data = x.slice();
            return linreg;
        };

        // ## Fitting The Regression Line
        //
        // This is called after `.data()` and returns the
        // equation `y = f(x)` which gives the position
        // of the regression line at each point in `x`.
        linreg.line = function() {

            //if there's only one point, arbitrarily choose a slope of 0
            //and a y-intercept of whatever the y of the initial point is
            if (data.length == 1) {
                m = 0;
                b = data[0][1];
            } else {
                // Initialize our sums and scope the `m` and `b`
                // variables that define the line.
                var sum_x = 0, sum_y = 0,
                    sum_xx = 0, sum_xy = 0,
                    m, b;

                // Gather the sum of all x values, the sum of all
                // y values, and the sum of x^2 and (x*y) for each
                // value.
                //
                // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy
                for (var i = 0; i < data.length; i++) {
                    sum_x += data[i][0];
                    sum_y += data[i][1];

                    sum_xx += data[i][0] * data[i][0];
                    sum_xy += data[i][0] * data[i][1];
                }

                // `m` is the slope of the regression line
                m = ((data.length * sum_xy) - (sum_x * sum_y)) /
                    ((data.length * sum_xx) - (sum_x * sum_x));

                // `b` is the y-intercept of the line.
                b = (sum_y / data.length) - ((m * sum_x) / data.length);
            }

            // Return a function that computes a `y` value for each
            // x value it is given, based on the values of `b` and `a`
            // that we just computed.
            return function(x) {
                return b + (m * x);
            };
        };

        return linreg;
    };

    // # [R Squared](http://en.wikipedia.org/wiki/Coefficient_of_determination)
    //
    // The r-squared value of data compared with a function `f`
    // is the sum of the squared differences between the prediction
    // and the actual value.
    ss.r_squared = function(data, f) {
        if (data.length < 2) return 1;

        // Compute the average y value for the actual
        // data set in order to compute the
        // _total sum of squares_
        var sum = 0, average;
        for (var i = 0; i < data.length; i++) {
            sum += data[i][1];
        }
        average = sum / data.length;

        // Compute the total sum of squares - the
        // squared difference between each point
        // and the average of all points.
        var sum_of_squares = 0;
        for (var j = 0; j < data.length; j++) {
            sum_of_squares += Math.pow(average - data[j][1], 2);
        }

        // Finally estimate the error: the squared
        // difference between the estimate and the actual data
        // value at each point.
        var err = 0;
        for (var k = 0; k < data.length; k++) {
            err += Math.pow(data[k][1] - f(data[k][0]), 2);
        }

        // As the error grows larger, it's ratio to the
        // sum of squares increases and the r squared
        // value grows lower.
        return 1 - (err / sum_of_squares);
    };


    // # [Bayesian Classifier](http://en.wikipedia.org/wiki/Naive_Bayes_classifier)
    //
    // This is a naïve bayesian classifier that takes
    // singly-nested objects.
    ss.bayesian = function() {
        // The `bayes_model` object is what will be exposed
        // by this closure, with all of its extended methods, and will
        // have access to all scope variables, like `total_count`.
        var bayes_model = {},
            // The number of items that are currently
            // classified in the model
            total_count = 0,
            // Every item classified in the model
            data = {};

        // ## Train
        // Train the classifier with a new item, which has a single
        // dimension of Javascript literal keys and values.
        bayes_model.train = function(item, category) {
            // If the data object doesn't have any values
            // for this category, create a new object for it.
            if (!data[category]) data[category] = {};

            // Iterate through each key in the item.
            for (var k in item) {
                var v = item[k];
                // Initialize the nested object `data[category][k][item[k]]`
                // with an object of keys that equal 0.
                if (data[category][k] === undefined) data[category][k] = {};
                if (data[category][k][v] === undefined) data[category][k][v] = 0;

                // And increment the key for this key/value combination.
                data[category][k][item[k]]++;
            }
            // Increment the number of items classified
            total_count++;
        };

        // ## Score
        // Generate a score of how well this item matches all
        // possible categories based on its attributes
        bayes_model.score = function(item) {
            // Initialize an empty array of odds per category.
            var odds = {}, category;
            // Iterate through each key in the item,
            // then iterate through each category that has been used
            // in previous calls to `.train()`
            for (var k in item) {
                var v = item[k];
                for (category in data) {
                    // Create an empty object for storing key - value combinations
                    // for this category.
                    if (odds[category] === undefined) odds[category] = {};

                    // If this item doesn't even have a property, it counts for nothing,
                    // but if it does have the property that we're looking for from
                    // the item to categorize, it counts based on how popular it is
                    // versus the whole population.
                    if (data[category][k]) {
                        odds[category][k + '_' + v] = (data[category][k][v] || 0) / total_count;
                    } else {
                        odds[category][k + '_' + v] = 0;
                    }
                }
            }

            // Set up a new object that will contain sums of these odds by category
            var odds_sums = {};

            for (category in odds) {
                // Tally all of the odds for each category-combination pair -
                // the non-existence of a category does not add anything to the
                // score.
                for (var combination in odds[category]) {
                    if (odds_sums[category] === undefined) odds_sums[category] = 0;
                    odds_sums[category] += odds[category][combination];
                }
            }

            return odds_sums;
        };

        // Return the completed model.
        return bayes_model;
    };

    // # sum
    //
    // is simply the result of adding all numbers
    // together, starting from zero.
    //
    // This runs on `O(n)`, linear time in respect to the array
    ss.sum = function(x) {
        var sum = 0;
        for (var i = 0; i < x.length; i++) {
            sum += x[i];
        }
        return sum;
    };

    // # mean
    //
    // is the sum over the number of values
    //
    // This runs on `O(n)`, linear time in respect to the array
    ss.mean = function(x) {
        // The mean of no numbers is null
        if (x.length === 0) return null;

        return ss.sum(x) / x.length;
    };

    // # geometric mean
    //
    // a mean function that is more useful for numbers in different
    // ranges.
    //
    // this is the nth root of the input numbers multipled by each other
    //
    // This runs on `O(n)`, linear time in respect to the array
    ss.geometric_mean = function(x) {
        // The mean of no numbers is null
        if (x.length === 0) return null;

        // the starting value.
        var value = 1;

        for (var i = 0; i < x.length; i++) {
            // the geometric mean is only valid for positive numbers
            if (x[i] <= 0) return null;

            // repeatedly multiply the value by each number
            value *= x[i];
        }

        return Math.pow(value, 1 / x.length);
    };

    // Alias this into its common name
    ss.average = ss.mean;

    // # min
    //
    // This is simply the minimum number in the set.
    //
    // This runs on `O(n)`, linear time in respect to the array
    ss.min = function(x) {
        var min;
        for (var i = 0; i < x.length; i++) {
            // On the first iteration of this loop, min is
            // undefined and is thus made the minimum element in the array
            if (x[i] < min || min === undefined) min = x[i];
        }
        return min;
    };

    // # max
    //
    // This is simply the maximum number in the set.
    //
    // This runs on `O(n)`, linear time in respect to the array
    ss.max = function(x) {
        var max;
        for (var i = 0; i < x.length; i++) {
            // On the first iteration of this loop, min is
            // undefined and is thus made the minimum element in the array
            if (x[i] > max || max === undefined) max = x[i];
        }
        return max;
    };

    // # [variance](http://en.wikipedia.org/wiki/Variance)
    //
    // is the sum of squared deviations from the mean
    ss.variance = function(x) {
        // The variance of no numbers is null
        if (x.length === 0) return null;

        var mean = ss.mean(x),
            deviations = [];

        // Make a list of squared deviations from the mean.
        for (var i = 0; i < x.length; i++) {
            deviations.push(Math.pow(x[i] - mean, 2));
        }

        // Find the mean value of that list
        return ss.mean(deviations);
    };

    // # [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
    //
    // is just the square root of the variance.
    ss.standard_deviation = function(x) {
        // The standard deviation of no numbers is null
        if (x.length === 0) return null;

        return Math.sqrt(ss.variance(x));
    };

     ss.sum_squared_deviations = function(x) {
        // The variance of no numbers is null
        if (x.length <= 1) return null;

        var mean = ss.mean(x),
            sum = 0;

        // Make a list of squared deviations from the mean.
        for (var i = 0; i < x.length; i++) {
            sum += Math.pow(x[i] - mean, 2);
        }

        return sum;
     };

    // # [variance](http://en.wikipedia.org/wiki/Variance)
    //
    // is the sum of squared deviations from the mean
    ss.sample_variance = function(x) {
        var sum_squared_deviations = ss.sum_squared_deviations(x);
        if (sum_squared_deviations === null) return null;

        // Find the mean value of that list
        return sum_squared_deviations / (x.length - 1);
    };

    // # [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
    //
    // is just the square root of the variance.
    ss.sample_standard_deviation = function(x) {
        // The standard deviation of no numbers is null
        if (x.length <= 1) return null;

        return Math.sqrt(ss.sample_variance(x));
    };

    // # [covariance](http://en.wikipedia.org/wiki/Covariance)
    //
    // sample covariance of two datasets:
    // how much do the two datasets move together?
    // x and y are two datasets, represented as arrays of numbers.
    ss.sample_covariance = function(x, y) {

        // The two datasets must have the same length which must be more than 1
        if (x.length <= 1 || x.length != y.length){
          return null;
        }

        // determine the mean of each dataset so that we can judge each
        // value of the dataset fairly as the difference from the mean. this
        // way, if one dataset is [1, 2, 3] and [2, 3, 4], their covariance
        // does not suffer because of the difference in absolute values
        var xmean = ss.mean(x),
            ymean = ss.mean(y),
            sum = 0;

        // for each pair of values, the covariance increases when their
        // difference from the mean is associated - if both are well above
        // or if both are well below
        // the mean, the covariance increases significantly.
        for (var i = 0; i < x.length; i++){
            sum += (x[i] - xmean) * (y[i] - ymean);
        }

        // the covariance is weighted by the length of the datasets.
        return sum / (x.length - 1);
    };

    // # [correlation](http://en.wikipedia.org/wiki/Correlation_and_dependence)
    //
    // Gets a measure of how correlated two datasets are, between -1 and 1
    ss.sample_correlation = function(x, y) {
        var cov = ss.sample_covariance(x, y),
            xstd = ss.sample_standard_deviation(x),
            ystd = ss.sample_standard_deviation(y);

        if (cov === null || xstd === null || ystd === null) {
            return null;
        }

        return cov / xstd / ystd;
    };

    // # [median](http://en.wikipedia.org/wiki/Median)
    ss.median = function(x) {
        // The median of an empty list is null
        if (x.length === 0) return null;

        // Sorting the array makes it easy to find the center, but
        // use `.slice()` to ensure the original array `x` is not modified
        var sorted = x.slice().sort(function (a, b) { return a - b; });

        // If the length of the list is odd, it's the central number
        if (sorted.length % 2 === 1) {
            return sorted[(sorted.length - 1) / 2];
        // Otherwise, the median is the average of the two numbers
        // at the center of the list
        } else {
            var a = sorted[(sorted.length / 2) - 1];
            var b = sorted[(sorted.length / 2)];
            return (a + b) / 2;
        }
    };

    // # [mode](http://bit.ly/W5K4Yt)
    // This implementation is inspired by [science.js](https://github.com/jasondavies/science.js/blob/master/src/stats/mode.js)
    ss.mode = function(x) {

        // Handle edge cases:
        // The median of an empty list is null
        if (x.length === 0) return null;
        else if (x.length === 1) return x[0];

        // Sorting the array lets us iterate through it below and be sure
        // that every time we see a new number it's new and we'll never
        // see the same number twice
        var sorted = x.slice().sort(function (a, b) { return a - b; });

        // This assumes it is dealing with an array of size > 1, since size
        // 0 and 1 are handled immediately. Hence it starts at index 1 in the
        // array.
        var last = sorted[0],
            // store the mode as we find new modes
            mode,
            // store how many times we've seen the mode
            max_seen = 0,
            // how many times the current candidate for the mode
            // has been seen
            seen_this = 1;

        // end at sorted.length + 1 to fix the case in which the mode is
        // the highest number that occurs in the sequence. the last iteration
        // compares sorted[i], which is undefined, to the highest number
        // in the series
        for (var i = 1; i < sorted.length + 1; i++) {
            // we're seeing a new number pass by
            if (sorted[i] !== last) {
                // the last number is the new mode since we saw it more
                // often than the old one
                if (seen_this > max_seen) {
                    max_seen = seen_this;
                    seen_this = 1;
                    mode = last;
                }
                last = sorted[i];
            // if this isn't a new number, it's one more occurrence of
            // the potential mode
            } else { seen_this++; }
        }
        return mode;
    };

    // # [t-test](http://en.wikipedia.org/wiki/Student's_t-test)
    //
    // This is to compute a one-sample t-test, comparing the mean
    // of a sample to a known value, x.
    //
    // in this case, we're trying to determine whether the
    // population mean is equal to the value that we know, which is `x`
    // here. usually the results here are used to look up a
    // [p-value](http://en.wikipedia.org/wiki/P-value), which, for
    // a certain level of significance, will let you determine that the
    // null hypothesis can or cannot be rejected.
    ss.t_test = function(sample, x) {
      // The mean of the sample
      var sample_mean = ss.mean(sample);

      // The standard deviation of the sample
      var sd = ss.standard_deviation(sample);

      // Square root the length of the sample
      var rootN = Math.sqrt(sample.length);

      // Compute the known value against the sample,
      // returning the t value
      return (sample_mean - x) / (sd / rootN);
    };

    // # quantile
    // This is a population quantile, since we assume to know the entire
    // dataset in this library. Thus I'm trying to follow the
    // [Quantiles of a Population](http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population)
    // algorithm from wikipedia.
    //
    // Sample is a one-dimensional array of numbers,
    // and p is a decimal number from 0 to 1. In terms of a k/q
    // quantile, p = k/q - it's just dealing with fractions or dealing
    // with decimal values.
    ss.quantile = function(sample, p) {

        // We can't derive quantiles from an empty list
        if (sample.length === 0) return null;

        // invalid bounds. Microsoft Excel accepts 0 and 1, but
        // we won't.
        if (p >= 1 || p <= 0) return null;

        // Sort a copy of the array. We'll need a sorted array to index
        // the values in sorted order.
        var sorted = sample.slice().sort(function (a, b) { return a - b; });

        // Find a potential index in the list. In Wikipedia's terms, this
        // is I<sub>p</sub>.
        var idx = (sorted.length) * p;

        // If this isn't an integer, we'll round up to the next value in
        // the list.
        if (idx % 1 !== 0) {
            return sorted[Math.ceil(idx) - 1];
        } else if (sample.length % 2 === 0) {
            // If the list has even-length and we had an integer in the
            // first place, we'll take the average of this number
            // and the next value, if there is one
            return (sorted[idx - 1] + sorted[idx]) / 2;
        } else {
            // Finally, in the simple case of an integer value
            // with an odd-length list, return the sample value at the index.
            return sorted[idx];
        }
    };

    // Compute the matrices required for Jenks breaks. These matrices
    // can be used for any classing of data with `classes <= n_classes`
    ss.jenksMatrices = function(data, n_classes) {

        // in the original implementation, these matrices are referred to
        // as `LC` and `OP`
        //
        // * lower_class_limits (LC): optimal lower class limits
        // * variance_combinations (OP): optimal variance combinations for all classes
        var lower_class_limits = [],
            variance_combinations = [],
            // loop counters
            i, j,
            // the variance, as computed at each step in the calculation
            variance = 0;

        // Initialize and fill each matrix with zeroes
        for (i = 0; i < data.length + 1; i++) {
            var tmp1 = [], tmp2 = [];
            for (j = 0; j < n_classes + 1; j++) {
                tmp1.push(0);
                tmp2.push(0);
            }
            lower_class_limits.push(tmp1);
            variance_combinations.push(tmp2);
        }

        for (i = 1; i < n_classes + 1; i++) {
            lower_class_limits[1][i] = 1;
            variance_combinations[1][i] = 0;
            // in the original implementation, 9999999 is used but
            // since Javascript has `Infinity`, we use that.
            for (j = 2; j < data.length + 1; j++) {
                variance_combinations[j][i] = Infinity;
            }
        }

        for (var l = 2; l < data.length + 1; l++) {

            // `SZ` originally. this is the sum of the values seen thus
            // far when calculating variance.
            var sum = 0, 
                // `ZSQ` originally. the sum of squares of values seen
                // thus far
                sum_squares = 0,
                // `WT` originally. This is the number of 
                w = 0,
                // `IV` originally
                i4 = 0;

            // in several instances, you could say `Math.pow(x, 2)`
            // instead of `x * x`, but this is slower in some browsers
            // introduces an unnecessary concept.
            for (var m = 1; m < l + 1; m++) {

                // `III` originally
                var lower_class_limit = l - m + 1,
                    val = data[lower_class_limit - 1];

                // here we're estimating variance for each potential classing
                // of the data, for each potential number of classes. `w`
                // is the number of data points considered so far.
                w++;

                // increase the current sum and sum-of-squares
                sum += val;
                sum_squares += val * val;

                // the variance at this point in the sequence is the difference
                // between the sum of squares and the total x 2, over the number
                // of samples.
                variance = sum_squares - (sum * sum) / w;

                i4 = lower_class_limit - 1;

                if (i4 !== 0) {
                    for (j = 2; j < n_classes + 1; j++) {
                        if (variance_combinations[l][j] >=
                            (variance + variance_combinations[i4][j - 1])) {
                            lower_class_limits[l][j] = lower_class_limit;
                            variance_combinations[l][j] = variance +
                                variance_combinations[i4][j - 1];
                        }
                    }
                }
            }

            lower_class_limits[l][1] = 1;
            variance_combinations[l][1] = variance;
        }

        return {
            lower_class_limits: lower_class_limits,
            variance_combinations: variance_combinations
        };
    };

    // # [Jenks natural breaks optimization](http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
    //
    // Implementations: [1](http://danieljlewis.org/files/2010/06/Jenks.pdf) (python),
    // [2](https://github.com/vvoovv/djeo-jenks/blob/master/main.js) (buggy),
    // [3](https://github.com/simogeo/geostats/blob/master/lib/geostats.js#L407) (works)

    ss.jenks = function(data, n_classes) {

        // sort data in numerical order
        data = data.slice().sort(function (a, b) { return a - b; });

        // get our basic matrices
        var matrices = ss.jenksMatrices(data, n_classes),
            // we only need lower class limits here
            lower_class_limits = matrices.lower_class_limits,
            k = data.length - 1,
            kclass = [],
            countNum = n_classes;

        // the calculation of classes will never include the upper and
        // lower bounds, so we need to explicitly set them
        kclass[n_classes] = data[data.length - 1];
        kclass[0] = data[0];

        // the lower_class_limits matrix is used as indexes into itself
        // here: the `k` variable is reused in each iteration.
        while (countNum > 1) {
            kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
            k = lower_class_limits[k][countNum] - 1;
            countNum--;
        }

        return kclass;
    };

    // # Mixin
    //
    // Mixin simple_statistics to the Array native object. This is an optional
    // feature that lets you treat simple_statistics as a native feature
    // of Javascript.
    ss.mixin = function() {
        var support = !!(Object.defineProperty && Object.defineProperties);
        if (!support) throw new Error('without defineProperty, simple-statistics cannot be mixed in');

        // only methods which work on basic arrays in a single step
        // are supported
        var arrayMethods = ['median', 'standard_deviation', 'sum',
            'mean', 'min', 'max', 'quantile', 'geometric_mean'];

        // create a closure with a method name so that a reference
        // like `arrayMethods[i]` doesn't follow the loop increment
        function wrap(method) {
            return function() {
                // cast any arguments into an array, since they're
                // natively objects
                var args = Array.prototype.slice.apply(arguments);
                // make the first argument the array itself
                args.unshift(this);
                // return the result of the ss method
                return ss[method].apply(ss, args);
            };
        }

        // for each array function, define a function off of the Array
        // prototype which automatically gets the array as the first
        // argument. We use [defineProperty](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty)
        // because it allows these properties to be non-enumerable:
        // `for (var in x)` loops will not run into problems with this
        // implementation.
        for (var i = 0; i < arrayMethods.length; i++) {
            Object.defineProperty(Array.prototype, arrayMethods[i], {
                value: wrap(arrayMethods[i]),
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    };

})(this);
 thumbnail.png
thumbnail.png
 unemployment.tsv

Search this file…
id	rate
1001	.097
1003	.091
1005	.134
1007	.121
1009	.099
1011	.164
1013	.167
1015	.108
1017	.186
1019	.118
1021	.099
1023	.127
1025	.17
1027	.159
1029	.104
1031	.085
1033	.114
1035	.195
1037	.14
1039	.101
1041	.097
1043	.096
1045	.093
1047	.211
1049	.143
1051	.09
1053	.129
1055	.107
1057	.128
1059	.123
1061	.1
1063	.147
1065	.127
1067	.099
1069	.089
1071	.118
1073	.107
1075	.148
1077	.105
1079	.136
1081	.086
1083	.093
1085	.185
1087	.114
1089	.075
1091	.148
1093	.152
1095	.092
1097	.111
1099	.187
1101	.102
1103	.104
1105	.198
1107	.13
1109	.087
1111	.151
1113	.126
1115	.107
1117	.076
1119	.139
1121	.136
1123	.137
1125	.09
1127	.119
1129	.151
1131	.256
1133	.175
2013	.101
2016	.084
2020	.07
2050	.148
2060	.036
2068	.034
2070	.084
2090	.069
2100	.062
2110	.057
2122	.097
2130	.061
2150	.066
2164	.059
2170	.088
2180	.121
2185	.057
2188	.132
2201	.136
2220	.059
2232	.073
2240	.081
2261	.064
2270	.204
2280	.098
2282	.063
2290	.136
4001	.148
4003	.074
4005	.077
4007	.109
4009	.144
4011	.215
4012	.089
4013	.085
4015	.102
4017	.142
4019	.084
4021	.118
4023	.172
4025	.095
4027	.242
5001	.143
5003	.091
5005	.082
5007	.053
5009	.064
5011	.078
5013	.062
5015	.043
5017	.096
5019	.063
5021	.104
5023	.059
5025	.06
5027	.081
5029	.065
5031	.059
5033	.066
5035	.099
5037	.071
5039	.076
5041	.099
5043	.091
5045	.06
5047	.059
5049	.061
5051	.066
5053	.057
5055	.082
5057	.086
5059	.073
5061	.072
5063	.078
5065	.077
5067	.092
5069	.092
5071	.061
5073	.086
5075	.079
5077	.082
5079	.082
5081	.056
5083	.077
5085	.052
5087	.053
5089	.112
5091	.045
5093	.113
5095	.074
5097	.058
5099	.087
5101	.062
5103	.071
5105	.056
5107	.088
5109	.063
5111	.075
5113	.064
5115	.062
5117	.067
5119	.06
5121	.073
5123	.094
5125	.058
5127	.063
5129	.059
5131	.062
5133	.051
5135	.078
5137	.066
5139	.095
5141	.091
5143	.05
5145	.067
5147	.091
5149	.064
6001	.113
6003	.152
6005	.121
6007	.122
6009	.143
6011	.145
6013	.112
6015	.119
6017	.112
6019	.141
6021	.138
6023	.103
6025	.301
6027	.095
6029	.139
6031	.139
6033	.147
6035	.118
6037	.127
6039	.123
6041	.08
6043	.088
6045	.101
6047	.157
6049	.111
6051	.103
6053	.1
6055	.087
6057	.109
6059	.094
6061	.113
6063	.139
6065	.147
6067	.122
6069	.125
6071	.136
6073	.102
6075	.097
6077	.155
6079	.09
6081	.09
6083	.085
6085	.118
6087	.102
6089	.147
6091	.137
6093	.135
6095	.115
6097	.099
6099	.153
6101	.151
6103	.137
6105	.159
6107	.149
6109	.127
6111	.11
6113	.109
6115	.178
8001	.081
8003	.055
8005	.069
8007	.062
8009	.034
8011	.05
8013	.055
8014	.066
8015	.051
8017	.02
8019	.07
8021	.051
8023	.084
8025	.076
8027	.052
8029	.066
8031	.077
8033	.132
8035	.059
8037	.062
8039	.06
8041	.072
8043	.077
8045	.058
8047	.06
8049	.058
8051	.044
8053	.022
8055	.072
8057	.033
8059	.067
8061	.028
8063	.029
8065	.071
8067	.047
8069	.056
8071	.07
8073	.037
8075	.046
8077	.082
8079	.053
8081	.056
8083	.063
8085	.069
8087	.049
8089	.058
8091	.041
8093	.061
8095	.026
8097	.05
8099	.05
8101	.075
8103	.039
8105	.048
8107	.06
8109	.078
8111	.053
8113	.042
8115	.033
8117	.058
8119	.067
8121	.032
8123	.075
8125	.026
9001	.078
9003	.088
9005	.079
9007	.067
9009	.089
9011	.076
9013	.067
9015	.09
10001	.079
10003	.086
10005	.073
11001	.117
12001	.071
12003	.114
12005	.089
12007	.083
12009	.111
12011	.098
12013	.082
12015	.127
12017	.121
12019	.098
12021	.131
12023	.09
12027	.117
12029	.123
12031	.112
12033	.098
12035	.162
12037	.071
12039	.096
12041	.1
12043	.1
12045	.098
12047	.113
12049	.126
12051	.168
12053	.138
12055	.116
12057	.115
12059	.072
12061	.152
12063	.072
12065	.085
12067	.072
12069	.123
12071	.139
12073	.072
12075	.121
12077	.053
12079	.117
12081	.127
12083	.133
12085	.119
12086	.113
12087	.07
12089	.107
12091	.072
12093	.133
12095	.114
12097	.128
12099	.117
12101	.125
12103	.112
12105	.127
12107	.122
12109	.09
12111	.153
12113	.094
12115	.123
12117	.106
12119	.09
12121	.098
12123	.104
12125	.084
12127	.117
12129	.072
12131	.068
12133	.096
13001	.097
13003	.126
13005	.085
13007	.091
13009	.116
13011	.067
13013	.111
13015	.133
13017	.153
13019	.124
13021	.1
13023	.097
13025	.116
13027	.087
13029	.081
13031	.09
13033	.122
13035	.127
13037	.111
13039	.091
13043	.093
13045	.108
13047	.08
13049	.106
13051	.085
13053	.146
13055	.114
13057	.095
13059	.07
13061	.082
13063	.123
13065	.11
13067	.096
13069	.168
13071	.09
13073	.07
13075	.119
13077	.1
13079	.095
13081	.121
13083	.09
13085	.101
13087	.127
13089	.107
13091	.112
13093	.101
13095	.111
13097	.114
13099	.105
13101	.067
13103	.079
13105	.122
13107	.103
13109	.089
13111	.1
13113	.084
13115	.111
13117	.086
13119	.118
13121	.107
13123	.098
13125	.111
13127	.082
13129	.131
13131	.098
13133	.111
13135	.094
13137	.094
13139	.091
13141	.177
13143	.113
13145	.072
13147	.138
13149	.124
13151	.104
13153	.073
13155	.145
13157	.109
13159	.127
13161	.135
13163	.149
13165	.196
13167	.119
13169	.086
13171	.153
13173	.084
13175	.108
13177	.079
13179	.085
13181	.103
13183	.059
13185	.082
13187	.111
13189	.121
13191	.096
13193	.13
13195	.083
13197	.099
13199	.132
13201	.087
13205	.104
13207	.102
13209	.085
13211	.098
13213	.123
13215	.092
13217	.126
13219	.062
13221	.082
13223	.107
13225	.102
13227	.108
13229	.093
13231	.118
13233	.108
13235	.071
13237	.104
13239	.118
13241	.104
13243	.13
13245	.103
13247	.12
13249	.138
13251	.137
13253	.107
13255	.154
13257	.107
13259	.107
13261	.129
13263	.098
13265	.124
13267	.087
13269	.13
13271	.162
13273	.116
13275	.093
13277	.106
13279	.098
13281	.078
13283	.119
13285	.129
13287	.13
13289	.114
13291	.09
13293	.133
13295	.096
13297	.11
13299	.107
13301	.188
13303	.14
13305	.117
13307	.091
13309	.091
13311	.095
13313	.125
13315	.116
13317	.117
13319	.107
13321	.108
15001	.108
15003	.063
15007	.096
15009	.097
16001	.091
16003	.121
16005	.084
16007	.052
16009	.121
16011	.059
16013	.077
16015	.071
16017	.095
16019	.059
16021	.12
16023	.045
16025	.11
16027	.106
16029	.06
16031	.059
16033	.041
16035	.118
16037	.039
16039	.077
16041	.04
16043	.066
16045	.104
16047	.055
16049	.083
16051	.068
16053	.059
16055	.087
16057	.059
16059	.065
16061	.052
16063	.097
16065	.055
16067	.06
16069	.055
16071	.05
16073	.041
16075	.077
16077	.067
16079	.119
16081	.051
16083	.068
16085	.114
16087	.084
17001	.079
17003	.112
17005	.093
17007	.138
17009	.045
17011	.109
17013	.095
17015	.105
17017	.073
17019	.082
17021	.099
17023	.131
17025	.114
17027	.079
17029	.091
17031	.106
17033	.105
17035	.097
17037	.092
17039	.092
17041	.091
17043	.086
17045	.107
17047	.091
17049	.079
17051	.116
17053	.104
17055	.146
17057	.125
17059	.11
17061	.092
17063	.114
17065	.093
17067	.113
17069	.128
17071	.094
17073	.086
17075	.1
17077	.073
17079	.095
17081	.1
17083	.088
17085	.081
17087	.104
17089	.099
17091	.128
17093	.104
17095	.103
17097	.1
17099	.124
17101	.103
17103	.109
17105	.107
17107	.095
17109	.077
17111	.093
17113	.074
17115	.124
17117	.105
17119	.097
17121	.119
17123	.106
17125	.143
17127	.08
17129	.078
17131	.089
17133	.078
17135	.122
17137	.084
17139	.09
17141	.119
17143	.116
17145	.119
17147	.082
17149	.081
17151	.106
17153	.119
17155	.15
17157	.094
17159	.105
17161	.095
17163	.108
17165	.112
17167	.079
17169	.066
17171	.075
17173	.1
17175	.098
17177	.116
17179	.113
17181	.108
17183	.12
17185	.103
17187	.08
17189	.08
17191	.097
17193	.086
17195	.106
17197	.099
17199	.096
17201	.155
17203	.086
18001	.134
18003	.093
18005	.088
18007	.09
18009	.133
18011	.068
18013	.078
18015	.099
18017	.105
18019	.082
18021	.096
18023	.092
18025	.105
18027	.049
18029	.089
18031	.11
18033	.124
18035	.095
18037	.08
18039	.15
18041	.134
18043	.074
18045	.116
18047	.089
18049	.112
18051	.067
18053	.111
18055	.071
18057	.061
18059	.078
18061	.078
18063	.068
18065	.12
18067	.119
18069	.111
18071	.101
18073	.087
18075	.104
18077	.095
18079	.122
18081	.074
18083	.066
18085	.11
18087	.14
18089	.094
18091	.107
18093	.111
18095	.097
18097	.084
18099	.114
18101	.063
18103	.123
18105	.056
18107	.097
18109	.075
18111	.089
18113	.145
18115	.105
18117	.092
18119	.081
18121	.083
18123	.088
18125	.087
18127	.082
18129	.07
18131	.095
18133	.082
18135	.102
18137	.091
18139	.095
18141	.104
18143	.121
18145	.088
18147	.081
18149	.126
18151	.129
18153	.093
18155	.07
18157	.085
18159	.103
18161	.086
18163	.074
18165	.108
18167	.092
18169	.12
18171	.101
18173	.069
18175	.112
18177	.109
18179	.091
18181	.094
18183	.116
19001	.051
19003	.06
19005	.093
19007	.094
19009	.051
19011	.058
19013	.058
19015	.059
19017	.05
19019	.059
19021	.055
19023	.06
19025	.054
19027	.042
19029	.058
19031	.057
19033	.067
19035	.044
19037	.084
19039	.074
19041	.062
19043	.079
19045	.077
19047	.047
19049	.051
19051	.101
19053	.066
19055	.068
19057	.082
19059	.058
19061	.06
19063	.086
19065	.085
19067	.087
19069	.07
19071	.07
19073	.063
19075	.049
19077	.056
19079	.081
19081	.09
19083	.06
19085	.044
19087	.088
19089	.086
19091	.062
19093	.058
19095	.058
19097	.077
19099	.081
19101	.087
19103	.044
19105	.063
19107	.071
19109	.056
19111	.114
19113	.065
19115	.08
19117	.06
19119	.043
19121	.058
19123	.077
19125	.057
19127	.07
19129	.043
19131	.054
19133	.071
19135	.075
19137	.087
19139	.089
19141	.053
19143	.054
19145	.087
19147	.07
19149	.047
19151	.052
19153	.062
19155	.048
19157	.066
19159	.053
19161	.047
19163	.073
19165	.039
19167	.041
19169	.045
19171	.066
19173	.067
19175	.06
19177	.08
19179	.094
19181	.058
19183	.049
19185	.064
19187	.083
19189	.091
19191	.058
19193	.057
19195	.063
19197	.084
20001	.078
20003	.079
20005	.081
20007	.051
20009	.061
20011	.065
20013	.056
20015	.072
20017	.054
20019	.084
20021	.085
20023	.037
20025	.037
20027	.042
20029	.045
20031	.057
20033	.038
20035	.076
20037	.081
20039	.033
20041	.051
20043	.088
20045	.054
20047	.044
20049	.11
20051	.036
20053	.041
20055	.043
20057	.038
20059	.071
20061	.069
20063	.035
20065	.043
20067	.042
20069	.034
20071	.045
20073	.072
20075	.042
20077	.056
20079	.074
20081	.037
20083	.042
20085	.06
20087	.067
20089	.049
20091	.068
20093	.045
20095	.063
20097	.049
20099	.078
20101	.034
20103	.073
20105	.063
20107	.084
20109	.04
20111	.057
20113	.051
20115	.063
20117	.049
20119	.042
20121	.068
20123	.058
20125	.094
20127	.068
20129	.047
20131	.043
20133	.07
20135	.04
20137	.047
20139	.07
20141	.044
20143	.065
20145	.037
20147	.06
20149	.041
20151	.053
20153	.035
20155	.063
20157	.041
20159	.051
20161	.032
20163	.073
20165	.059
20167	.046
20169	.057
20171	.032
20173	.088
20175	.051
20177	.064
20179	.032
20181	.039
20183	.043
20185	.061
20187	.034
20189	.053
20191	.09
20193	.036
20195	.036
20197	.066
20199	.059
20201	.045
20203	.035
20205	.102
20207	.089
20209	.104
21001	.101
21003	.143
21005	.109
21007	.102
21009	.116
21011	.133
21013	.125
21015	.092
21017	.091
21019	.083
21021	.11
21023	.102
21025	.1
21027	.121
21029	.108
21031	.137
21033	.109
21035	.08
21037	.107
21039	.091
21041	.124
21043	.135
21045	.102
21047	.129
21049	.114
21051	.135
21053	.09
21055	.108
21057	.13
21059	.091
21061	.128
21063	.126
21065	.129
21067	.077
21069	.122
21071	.124
21073	.091
21075	.144
21077	.111
21079	.119
21081	.101
21083	.103
21085	.164
21087	.124
21089	.098
21091	.136
21093	.1
21095	.125
21097	.111
21099	.106
21101	.098
21103	.107
21105	.092
21107	.091
21109	.175
21111	.105
21113	.088
21115	.111
21117	.1
21119	.12
21121	.115
21123	.107
21125	.101
21127	.131
21129	.123
21131	.137
21133	.12
21135	.151
21137	.121
21139	.098
21141	.104
21143	.122
21145	.091
21147	.133
21149	.106
21151	.087
21153	.214
21155	.129
21157	.107
21159	.124
21161	.111
21163	.124
21165	.147
21167	.108
21169	.158
21171	.14
21173	.126
21175	.145
21177	.107
21179	.115
21181	.125
21183	.094
21185	.086
21187	.101
21189	.112
21191	.117
21193	.125
21195	.107
21197	.167
21199	.1
21201	.096
21203	.128
21205	.086
21207	.108
21209	.091
21211	.096
21213	.118
21215	.102
21217	.102
21219	.126
21221	.16
21223	.107
21225	.108
21227	.092
21229	.127
21231	.136
21233	.088
21235	.114
21237	.139
21239	.083
22001	.071
22003	.101
22005	.067
22007	.088
22009	.081
22011	.08
22013	.105
22015	.064
22017	.079
22019	.072
22021	.107
22023	.056
22025	.103
22027	.103
22029	.113
22031	.09
22033	.068
22035	.142
22037	.08
22039	.086
22041	.113
22043	.082
22045	.076
22047	.104
22049	.078
22051	.065
22053	.064
22055	.059
22057	.049
22059	.073
22061	.078
22063	.07
22065	.093
22067	.151
22069	.084
22071	.107
22073	.076
22075	.062
22077	.079
22079	.069
22081	.096
22083	.107
22085	.081
22087	.105
22089	.065
22091	.118
22093	.1
22095	.084
22097	.083
22099	.075
22101	.086
22103	.052
22105	.081
22107	.135
22109	.052
22111	.122
22113	.072
22115	.067
22117	.096
22119	.091
22121	.074
22123	.17
22125	.082
22127	.091
23001	.084
23003	.093
23005	.065
23007	.112
23009	.068
23011	.073
23013	.07
23015	.063
23017	.109
23019	.08
23021	.116
23023	.067
23025	.107
23027	.078
23029	.104
23031	.074
24001	.075
24003	.065
24005	.077
24009	.059
24011	.088
24013	.06
24015	.086
24017	.059
24019	.109
24021	.059
24023	.069
24025	.071
24027	.054
24029	.071
24031	.053
24033	.073
24035	.066
24037	.056
24039	.095
24041	.068
24043	.094
24045	.077
24047	.075
24510	.106
25001	.08
25003	.084
25005	.118
25007	.05
25009	.101
25011	.087
25013	.105
25015	.073
25017	.081
25019	.05
25021	.085
25023	.097
25025	.093
25027	.101
26001	.167
26003	.12
26005	.132
26007	.139
26009	.147
26011	.158
26013	.243
26015	.105
26017	.123
26019	.12
26021	.135
26023	.14
26025	.124
26027	.114
26029	.139
26031	.086
26033	.116
26035	.168
26037	.094
26039	.137
26041	.115
26043	.12
26045	.103
26047	.122
26049	.158
26051	.165
26053	.133
26055	.12
26057	.137
26059	.172
26061	.102
26063	.148
26065	.116
26067	.134
26069	.164
26071	.117
26073	.085
26075	.149
26077	.112
26079	.143
26081	.117
26083	.119
26085	.175
26087	.181
26089	.09
26091	.161
26093	.136
26095	.132
26097	.061
26099	.181
26101	.126
26103	.101
26105	.129
26107	.13
26109	.125
26111	.102
26113	.15
26115	.142
26117	.176
26119	.189
26121	.16
26123	.138
26125	.156
26127	.152
26129	.127
26131	.138
26133	.153
26135	.191
26137	.147
26139	.128
26141	.16
26143	.146
26145	.129
26147	.19
26149	.139
26151	.178
26153	.127
26155	.152
26157	.163
26159	.132
26161	.093
26163	.183
26165	.183
27001	.081
27003	.079
27005	.064
27007	.072
27009	.07
27011	.045
27013	.063
27015	.055
27017	.073
27019	.07
27021	.079
27023	.061
27025	.084
27027	.036
27029	.091
27031	.047
27033	.052
27035	.074
27037	.069
27039	.061
27041	.056
27043	.076
27045	.07
27047	.076
27049	.067
27051	.068
27053	.073
27055	.071
27057	.073
27059	.083
27061	.092
27063	.047
27065	.103
27067	.055
27069	.052
27071	.073
27073	.054
27075	.075
27077	.069
27079	.086
27081	.045
27083	.049
27085	.08
27087	.06
27089	.062
27091	.069
27093	.078
27095	.105
27097	.09
27099	.055
27101	.039
27103	.061
27105	.045
27107	.051
27109	.055
27111	.063
27113	.056
27115	.091
27117	.053
27119	.044
27121	.064
27123	.074
27125	.067
27127	.061
27129	.064
27131	.075
27133	.051
27135	.05
27137	.082
27139	.068
27141	.081
27143	.065
27145	.068
27147	.077
27149	.043
27151	.066
27153	.075
27155	.062
27157	.071
27159	.088
27161	.07
27163	.068
27165	.075
27167	.047
27169	.07
27171	.082
27173	.051
28001	.08
28003	.113
28005	.086
28007	.118
28009	.126
28011	.09
28013	.097
28015	.098
28017	.132
28019	.113
28021	.15
28023	.1
28025	.178
28027	.111
28029	.099
28031	.077
28033	.072
28035	.077
28037	.09
28039	.1
28041	.099
28043	.11
28045	.075
28047	.072
28049	.079
28051	.166
28053	.102
28055	.092
28057	.096
28059	.08
28061	.102
28063	.155
28065	.106
28067	.071
28069	.103
28071	.069
28073	.066
28075	.087
28077	.102
28079	.087
28081	.098
28083	.116
28085	.088
28087	.102
28089	.063
28091	.101
28093	.112
28095	.137
28097	.127
28099	.084
28101	.079
28103	.176
28105	.08
28107	.119
28109	.083
28111	.104
28113	.098
28115	.087
28117	.115
28119	.111
28121	.056
28123	.059
28125	.09
28127	.082
28129	.082
28131	.072
28133	.118
28135	.099
28137	.103
28139	.125
28141	.101
28143	.13
28145	.088
28147	.103
28149	.091
28151	.113
28153	.094
28155	.135
28157	.101
28159	.151
28161	.129
28163	.105
29001	.065
29003	.076
29005	.079
29007	.092
29009	.081
29011	.117
29013	.108
29015	.093
29017	.088
29019	.062
29021	.087
29023	.08
29025	.086
29027	.08
29029	.079
29031	.069
29033	.098
29035	.087
29037	.097
29039	.086
29041	.105
29043	.08
29045	.113
29047	.086
29049	.087
29051	.067
29053	.084
29055	.107
29057	.101
29059	.094
29061	.087
29063	.093
29065	.094
29067	.098
29069	.111
29071	.115
29073	.108
29075	.068
29077	.083
29079	.069
29081	.078
29083	.096
29085	.123
29087	.071
29089	.083
29091	.092
29093	.087
29095	.109
29097	.084
29099	.106
29101	.08
29103	.059
29105	.11
29107	.09
29109	.078
29111	.083
29113	.113
29115	.103
29117	.078
29119	.07
29121	.079
29123	.098
29125	.087
29127	.089
29129	.079
29131	.106
29133	.097
29135	.078
29137	.11
29139	.103
29141	.113
29143	.089
29145	.079
29147	.059
29149	.09
29151	.099
29153	.076
29155	.121
29157	.072
29159	.081
29161	.071
29163	.083
29165	.08
29167	.089
29169	.068
29171	.074
29173	.08
29175	.094
29177	.083
29179	.127
29181	.095
29183	.087
29185	.103
29186	.093
29187	.109
29189	.096
29195	.079
29197	.078
29199	.122
29201	.092
29203	.096
29205	.081
29207	.09
29209	.09
29211	.064
29213	.086
29215	.088
29217	.079
29219	.112
29221	.137
29223	.095
29225	.09
29227	.084
29229	.096
29510	.111
30001	.044
30003	.102
30005	.05
30007	.062
30009	.048
30011	.039
30013	.052
30015	.042
30017	.046
30019	.042
30021	.048
30023	.065
30025	.037
30027	.047
30029	.088
30031	.055
30033	.034
30035	.072
30037	.047
30039	.082
30041	.051
30043	.058
30045	.046
30047	.083
30049	.043
30051	.047
30053	.111
30055	.032
30057	.048
30059	.078
30061	.086
30063	.056
30065	.075
30067	.061
30069	.045
30071	.048
30073	.06
30075	.04
30077	.073
30079	.031
30081	.075
30083	.046
30085	.075
30087	.073
30089	.112
30091	.043
30093	.055
30095	.052
30097	.031
30099	.04
30101	.041
30103	.051
30105	.046
30107	.043
30109	.041
30111	.047
31001	.056
31003	.036
31005	.044
31007	.035
31009	.052
31011	.039
31013	.071
31015	.036
31017	.031
31019	.035
31021	.057
31023	.039
31025	.046
31027	.032
31029	.03
31031	.025
31033	.041
31035	.043
31037	.04
31039	.035
31041	.031
31043	.055
31045	.044
31047	.048
31049	.038
31051	.037
31053	.049
31055	.05
31057	.04
31059	.044
31061	.037
31063	.03
31065	.041
31067	.059
31069	.044
31071	.025
31073	.038
31075	.031
31077	.033
31079	.044
31081	.034
31083	.036
31085	.042
31087	.066
31089	.032
31091	.04
31093	.038
31095	.046
31097	.039
31099	.038
31101	.039
31103	.044
31105	.043
31107	.036
31109	.042
31111	.04
31113	.043
31115	.032
31117	.04
31119	.042
31121	.04
31123	.041
31125	.036
31127	.054
31129	.047
31131	.05
31133	.041
31135	.031
31137	.038
31139	.036
31141	.044
31143	.042
31145	.042
31147	.057
31149	.031
31151	.04
31153	.047
31155	.045
31157	.048
31159	.037
31161	.035
31163	.03
31165	.038
31167	.036
31169	.043
31171	.038
31173	.138
31175	.029
31177	.041
31179	.038
31181	.042
31183	.032
31185	.057
32001	.099
32003	.139
32005	.126
32007	.068
32009	.083
32011	.093
32013	.086
32015	.072
32017	.094
32019	.163
32021	.105
32023	.161
32027	.106
32029	.148
32031	.131
32033	.084
32510	.128
33001	.07
33003	.054
33005	.065
33007	.078
33009	.056
33011	.075
33013	.063
33015	.075
33017	.066
33019	.065
34001	.122
34003	.084
34005	.091
34007	.109
34009	.085
34011	.126
34013	.111
34015	.1
34017	.116
34019	.069
34021	.081
34023	.092
34025	.087
34027	.076
34029	.096
34031	.117
34033	.101
34035	.079
34037	.085
34039	.098
34041	.088
35001	.075
35003	.081
35005	.068
35006	.063
35007	.08
35009	.044
35011	.043
35013	.069
35015	.06
35017	.123
35019	.075
35021	.045
35023	.076
35025	.083
35027	.051
35028	.029
35029	.134
35031	.086
35033	.131
35035	.068
35037	.059
35039	.072
35041	.044
35043	.09
35045	.083
35047	.078
35049	.065
35051	.048
35053	.05
35055	.087
35057	.088
35059	.055
35061	.085
36001	.071
36003	.079
36005	.133
36007	.085
36009	.085
36011	.08
36013	.078
36015	.089
36017	.087
36019	.09
36021	.077
36023	.085
36025	.084
36027	.082
36029	.083
36031	.078
36033	.078
36035	.091
36037	.072
36039	.084
36041	.056
36043	.076
36045	.078
36047	.11
36049	.076
36051	.075
36053	.074
36055	.083
36057	.088
36059	.072
36061	.092
36063	.088
36065	.073
36067	.079
36069	.067
36071	.082
36073	.082
36075	.093
36077	.068
36079	.07
36081	.091
36083	.077
36085	.089
36087	.074
36089	.089
36091	.064
36093	.078
36095	.076
36097	.074
36099	.073
36101	.095
36103	.075
36105	.086
36107	.079
36109	.056
36111	.081
36113	.072
36115	.074
36117	.078
36119	.074
36121	.078
36123	.06
37001	.118
37003	.136
37005	.109
37007	.148
37009	.1
37011	.079
37013	.112
37015	.105
37017	.12
37019	.105
37021	.082
37023	.141
37025	.114
37027	.152
37029	.071
37031	.076
37033	.124
37035	.136
37037	.08
37039	.142
37041	.119
37043	.108
37045	.143
37047	.125
37049	.1
37051	.091
37053	.05
37055	.068
37057	.125
37059	.121
37061	.087
37063	.08
37065	.163
37067	.095
37069	.097
37071	.133
37073	.071
37075	.134
37077	.102
37079	.102
37081	.11
37083	.131
37085	.109
37087	.085
37089	.086
37091	.094
37093	.083
37095	.059
37097	.121
37099	.078
37101	.095
37103	.109
37105	.135
37107	.114
37109	.132
37111	.141
37113	.092
37115	.093
37117	.106
37119	.11
37121	.11
37123	.133
37125	.095
37127	.119
37129	.091
37131	.107
37133	.083
37135	.063
37137	.101
37139	.091
37141	.108
37143	.103
37145	.108
37147	.1
37149	.082
37151	.11
37153	.132
37155	.115
37157	.117
37159	.128
37161	.143
37163	.083
37165	.165
37167	.119
37169	.101
37171	.118
37173	.091
37175	.085
37177	.088
37179	.1
37181	.13
37183	.083
37185	.127
37187	.117
37189	.069
37191	.088
37193	.129
37195	.119
37197	.093
37199	.109
38001	.027
38003	.034
38005	.053
38007	.013
38009	.029
38011	.027
38013	.022
38015	.028
38017	.037
38019	.025
38021	.041
38023	.034
38025	.036
38027	.038
38029	.051
38031	.028
38033	.025
38035	.035
38037	.032
38039	.036
38041	.027
38043	.034
38045	.043
38047	.027
38049	.029
38051	.031
38053	.022
38055	.034
38057	.033
38059	.03
38061	.044
38063	.029
38065	.031
38067	.051
38069	.04
38071	.032
38073	.06
38075	.033
38077	.043
38079	.097
38081	.065
38083	.037
38085	.043
38087	.012
38089	.028
38091	.021
38093	.032
38095	.026
38097	.035
38099	.045
38101	.028
38103	.038
38105	.02
39001	.138
39003	.102
39005	.114
39007	.126
39009	.086
39011	.101
39013	.092
39015	.119
39017	.091
39019	.132
39021	.114
39023	.099
39025	.094
39027	.139
39029	.125
39031	.123
39033	.132
39035	.085
39037	.099
39039	.117
39041	.067
39043	.095
39045	.082
39047	.117
39049	.082
39051	.121
39053	.095
39055	.065
39057	.094
39059	.108
39061	.089
39063	.091
39065	.112
39067	.106
39069	.109
39071	.153
39073	.104
39075	.063
39077	.128
39079	.105
39081	.127
39083	.087
39085	.079
39087	.084
39089	.089
39091	.112
39093	.091
39095	.113
39097	.085
39099	.118
39101	.102
39103	.075
39105	.152
39107	.078
39109	.11
39111	.115
39113	.11
39115	.146
39117	.1
39119	.119
39121	.14
39123	.107
39125	.115
39127	.128
39129	.103
39131	.147
39133	.092
39135	.111
39137	.09
39139	.118
39141	.115
39143	.108
39145	.121
39147	.12
39149	.119
39151	.11
39153	.096
39155	.135
39157	.102
39159	.08
39161	.132
39163	.113
39165	.085
39167	.094
39169	.089
39171	.141
39173	.1
39175	.112
40001	.076
40003	.055
40005	.084
40007	.033
40009	.059
40011	.057
40013	.052
40015	.061
40017	.055
40019	.057
40021	.056
40023	.076
40025	.035
40027	.052
40029	.088
40031	.051
40033	.04
40035	.055
40037	.081
40039	.049
40041	.06
40043	.046
40045	.045
40047	.045
40049	.059
40051	.074
40053	.042
40055	.079
40057	.069
40059	.043
40061	.084
40063	.107
40065	.048
40067	.086
40069	.07
40071	.081
40073	.043
40075	.062
40077	.104
40079	.087
40081	.067
40083	.056
40085	.054
40087	.056
40089	.116
40091	.082
40093	.045
40095	.075
40097	.081
40099	.047
40101	.081
40103	.077
40105	.093
40107	.089
40109	.061
40111	.085
40113	.074
40115	.062
40117	.082
40119	.063
40121	.065
40123	.051
40125	.065
40127	.089
40129	.045
40131	.072
40133	.092
40135	.087
40137	.084
40139	.038
40141	.056
40143	.068
40145	.066
40147	.059
40149	.063
40151	.042
40153	.065
41001	.085
41003	.075
41005	.104
41007	.082
41009	.126
41011	.117
41013	.161
41015	.112
41017	.135
41019	.14
41021	.056
41023	.099
41025	.15
41027	.066
41029	.115
41031	.129
41033	.133
41035	.12
41037	.101
41039	.115
41041	.094
41043	.136
41045	.093
41047	.103
41049	.074
41051	.109
41053	.093
41055	.076
41057	.082
41059	.078
41061	.102
41063	.087
41065	.08
41067	.096
41069	.067
41071	.11
42001	.074
42003	.072
42005	.08
42007	.084
42009	.109
42011	.091
42013	.074
42015	.076
42017	.073
42019	.071
42021	.088
42023	.167
42025	.1
42027	.056
42029	.063
42031	.083
42033	.098
42035	.082
42037	.082
42039	.101
42041	.068
42043	.081
42045	.079
42047	.129
42049	.092
42051	.091
42053	.102
42055	.086
42057	.143
42059	.078
42061	.102
42063	.078
42065	.095
42067	.076
42069	.083
42071	.075
42073	.089
42075	.07
42077	.093
42079	.092
42081	.093
42083	.1
42085	.113
42087	.104
42089	.09
42091	.07
42093	.059
42095	.088
42097	.094
42099	.081
42101	.11
42103	.086
42105	.103
42107	.101
42109	.086
42111	.085
42113	.079
42115	.078
42117	.078
42119	.088
42121	.087
42123	.073
42125	.079
42127	.066
42129	.078
42131	.069
42133	.084
44001	.111
44003	.119
44005	.1
44007	.135
44009	.092
45001	.148
45003	.094
45005	.225
45007	.125
45009	.181
45011	.19
45013	.087
45015	.107
45017	.144
45019	.09
45021	.162
45023	.211
45025	.168
45027	.161
45029	.142
45031	.13
45033	.172
45035	.103
45037	.107
45039	.129
45041	.117
45043	.125
45045	.102
45047	.137
45049	.161
45051	.109
45053	.107
45055	.104
45057	.179
45059	.117
45061	.157
45063	.083
45065	.157
45067	.21
45069	.202
45071	.117
45073	.142
45075	.187
45077	.106
45079	.095
45081	.094
45083	.122
45085	.139
45087	.206
45089	.154
45091	.141
46003	.04
46005	.03
46007	.06
46009	.049
46011	.032
46013	.031
46015	.027
46017	.172
46019	.039
46021	.045
46023	.048
46025	.047
46027	.037
46029	.058
46031	.056
46033	.03
46035	.043
46037	.053
46039	.048
46041	.104
46043	.031
46045	.027
46047	.049
46049	.031
46051	.035
46053	.031
46055	.036
46057	.051
46059	.028
46061	.03
46063	.023
46065	.027
46067	.039
46069	.036
46071	.062
46073	.026
46075	.024
46077	.051
46079	.058
46081	.038
46083	.039
46085	.057
46087	.045
46089	.05
46091	.047
46093	.04
46095	.068
46097	.057
46099	.047
46101	.061
46103	.044
46105	.039
46107	.032
46109	.048
46111	.038
46113	.126
46115	.034
46117	.021
46119	.024
46121	.084
46123	.029
46125	.044
46127	.053
46129	.04
46135	.053
46137	.078
47001	.097
47003	.121
47005	.128
47007	.137
47009	.093
47011	.093
47013	.131
47015	.108
47017	.164
47019	.098
47021	.094
47023	.115
47025	.111
47027	.126
47029	.122
47031	.102
47033	.134
47035	.108
47037	.092
47039	.142
47041	.102
47043	.098
47045	.14
47047	.108
47049	.13
47051	.104
47053	.157
47055	.14
47057	.135
47059	.143
47061	.13
47063	.125
47065	.087
47067	.183
47069	.127
47071	.111
47073	.103
47075	.18
47077	.181
47079	.131
47081	.124
47083	.116
47085	.119
47087	.127
47089	.118
47091	.122
47093	.081
47095	.107
47097	.189
47099	.146
47101	.149
47103	.069
47105	.095
47107	.13
47109	.127
47111	.112
47113	.11
47115	.121
47117	.163
47119	.119
47121	.136
47123	.161
47125	.09
47127	.097
47129	.116
47131	.104
47133	.12
47135	.176
47137	.134
47139	.114
47141	.097
47143	.127
47145	.089
47147	.101
47149	.095
47151	.184
47153	.128
47155	.092
47157	.102
47159	.128
47161	.111
47163	.088
47165	.097
47167	.116
47169	.12
47171	.103
47173	.107
47175	.142
47177	.125
47179	.086
47181	.129
47183	.13
47185	.135
47187	.075
47189	.09
48001	.094
48003	.076
48005	.089
48007	.073
48009	.065
48011	.051
48013	.079
48015	.084
48017	.052
48019	.068
48021	.08
48023	.051
48025	.103
48027	.071
48029	.072
48031	.058
48033	.062
48035	.086
48037	.078
48039	.089
48041	.062
48043	.051
48045	.059
48047	.099
48049	.072
48051	.074
48053	.063
48055	.082
48057	.095
48059	.063
48061	.108
48063	.096
48065	.067
48067	.125
48069	.053
48071	.107
48073	.097
48075	.064
48077	.074
48079	.072
48081	.086
48083	.069
48085	.078
48087	.059
48089	.066
48091	.066
48093	.061
48095	.082
48097	.065
48099	.087
48101	.056
48103	.095
48105	.097
48107	.07
48109	.045
48111	.044
48113	.087
48115	.087
48117	.058
48119	.084
48121	.077
48123	.083
48125	.06
48127	.11
48129	.07
48131	.125
48133	.084
48135	.092
48137	.067
48139	.086
48141	.098
48143	.071
48145	.095
48147	.09
48149	.057
48151	.064
48153	.069
48155	.057
48157	.083
48159	.073
48161	.067
48163	.084
48165	.068
48167	.085
48169	.057
48171	.049
48173	.052
48175	.079
48177	.061
48179	.089
48181	.087
48183	.08
48185	.1
48187	.067
48189	.064
48191	.089
48193	.06
48195	.055
48197	.072
48199	.101
48201	.085
48203	.087
48205	.043
48207	.052
48209	.068
48211	.03
48213	.085
48215	.116
48217	.085
48219	.07
48221	.076
48223	.065
48225	.103
48227	.075
48229	.065
48231	.085
48233	.08
48235	.054
48237	.064
48239	.076
48241	.119
48243	.056
48245	.108
48247	.1
48249	.1
48251	.091
48253	.082
48255	.105
48257	.088
48259	.06
48261	.061
48263	.062
48265	.06
48267	.054
48269	.054
48271	.089
48273	.077
48275	.064
48277	.078
48279	.066
48281	.061
48283	.099
48285	.064
48287	.069
48289	.079
48291	.112
48293	.072
48295	.061
48297	.076
48299	.073
48301	.115
48303	.057
48305	.068
48307	.091
48309	.071
48311	.078
48313	.087
48315	.118
48317	.05
48319	.054
48321	.112
48323	.136
48325	.071
48327	.09
48329	.062
48331	.102
48333	.06
48335	.087
48337	.078
48339	.079
48341	.053
48343	.156
48345	.053
48347	.07
48349	.084
48351	.124
48353	.064
48355	.077
48357	.063
48359	.055
48361	.111
48363	.091
48365	.075
48367	.084
48369	.048
48371	.117
48373	.103
48375	.066
48377	.178
48379	.085
48381	.051
48383	.058
48385	.061
48387	.105
48389	.14
48391	.07
48393	.062
48395	.087
48397	.078
48399	.101
48401	.091
48403	.159
48405	.108
48407	.1
48409	.098
48411	.078
48413	.111
48415	.072
48417	.043
48419	.081
48421	.049
48423	.083
48425	.073
48427	.178
48429	.069
48431	.046
48433	.048
48435	.078
48437	.067
48439	.082
48441	.061
48443	.078
48445	.077
48447	.056
48449	.077
48451	.07
48453	.07
48455	.088
48457	.105
48459	.081
48461	.056
48463	.089
48465	.096
48467	.074
48469	.079
48471	.078
48473	.09
48475	.085
48477	.069
48479	.091
48481	.079
48483	.056
48485	.081
48487	.055
48489	.139
48491	.078
48493	.069
48495	.09
48497	.096
48499	.084
48501	.071
48503	.064
48505	.126
48507	.163
49001	.042
49003	.056
49005	.042
49007	.065
49009	.027
49011	.056
49013	.069
49015	.062
49017	.049
49019	.052
49021	.063
49023	.068
49025	.044
49027	.04
49029	.053
49031	.038
49033	.028
49035	.06
49037	.086
49039	.056
49041	.057
49043	.058
49045	.064
49047	.066
49049	.054
49051	.06
49053	.078
49055	.042
49057	.07
50001	.058
50003	.068
50005	.07
50007	.057
50009	.078
50011	.062
50013	.07
50015	.066
50017	.055
50019	.083
50021	.087
50023	.061
50025	.063
50027	.058
51001	.061
51003	.05
51005	.087
51007	.07
51009	.07
51011	.067
51013	.042
51015	.058
51017	.054
51019	.062
51021	.075
51023	.062
51025	.114
51027	.088
51029	.078
51031	.066
51033	.082
51035	.113
51036	.087
51037	.091
51041	.068
51043	.061
51045	.072
51047	.075
51049	.07
51051	.083
51053	.083
51057	.077
51059	.047
51061	.05
51063	.071
51065	.058
51067	.078
51069	.073
51071	.085
51073	.055
51075	.067
51077	.104
51079	.058
51081	.091
51083	.115
51085	.066
51087	.072
51089	.134
51091	.059
51093	.063
51095	.046
51097	.075
51099	.075
51101	.064
51103	.073
51105	.071
51107	.047
51109	.081
51111	.091
51113	.06
51115	.048
51117	.105
51119	.064
51121	.063
51125	.062
51127	.069
51131	.066
51133	.065
51135	.079
51137	.076
51139	.098
51141	.099
51143	.103
51145	.06
51147	.084
51149	.073
51153	.053
51155	.108
51157	.056
51159	.072
51161	.059
51163	.056
51165	.053
51167	.096
51169	.099
51171	.076
51173	.102
51175	.077
51177	.051
51179	.051
51181	.073
51183	.095
51185	.079
51187	.066
51191	.082
51193	.071
51195	.067
51197	.097
51199	.05
51510	.048
51515	.089
51520	.099
51530	.087
51540	.062
51550	.064
51570	.082
51580	.091
51590	.13
51595	.118
51600	.054
51610	.073
51620	.107
51630	.091
51640	.103
51650	.077
51660	.064
51670	.104
51678	.092
51680	.077
51683	.068
51685	.054
51690	.2
51700	.073
51710	.084
51720	.055
51730	.138
51735	.05
51740	.084
51750	.085
51760	.1
51770	.086
51775	.063
51790	.073
51800	.066
51810	.059
51820	.082
51830	.135
51840	.079
53001	.065
53003	.081
53005	.058
53007	.065
53009	.085
53011	.127
53013	.084
53015	.128
53017	.066
53019	.113
53021	.062
53023	.053
53025	.073
53027	.117
53029	.081
53031	.074
53033	.088
53035	.071
53037	.073
53039	.081
53041	.12
53043	.074
53045	.094
53047	.074
53049	.107
53051	.121
53053	.088
53055	.047
53057	.091
53059	.094
53061	.101
53063	.083
53065	.105
53067	.071
53069	.114
53071	.055
53073	.078
53075	.047
53077	.068
54001	.092
54003	.085
54005	.094
54007	.08
54009	.111
54011	.066
54013	.121
54015	.119
54017	.074
54019	.086
54021	.065
54023	.112
54025	.083
54027	.078
54029	.118
54031	.097
54033	.071
54035	.129
54037	.066
54039	.071
54041	.075
54043	.106
54045	.098
54047	.127
54049	.065
54051	.087
54053	.121
54055	.069
54057	.079
54059	.107
54061	.046
54063	.065
54065	.091
54067	.091
54069	.078
54071	.075
54073	.102
54075	.113
54077	.07
54079	.063
54081	.08
54083	.085
54085	.088
54087	.13
54089	.078
54091	.079
54093	.109
54095	.108
54097	.089
54099	.077
54101	.104
54103	.123
54105	.114
54107	.088
54109	.115
55001	.083
55003	.083
55005	.071
55007	.062
55009	.071
55011	.057
55013	.091
55015	.067
55017	.066
55019	.076
55021	.071
55023	.081
55025	.054
55027	.084
55029	.066
55031	.065
55033	.058
55035	.06
55037	.081
55039	.078
55041	.081
55043	.061
55045	.078
55047	.075
55049	.062
55051	.094
55053	.072
55055	.08
55057	.085
55059	.098
55061	.073
55063	.059
55065	.06
55067	.085
55069	.096
55071	.085
55073	.077
55075	.102
55077	.083
55078	.127
55079	.093
55081	.064
55083	.091
55085	.074
55087	.075
55089	.072
55091	.054
55093	.061
55095	.084
55097	.058
55099	.094
55101	.093
55103	.075
55105	.111
55107	.101
55109	.068
55111	.07
55113	.071
55115	.082
55117	.083
55119	.096
55121	.064
55123	.066
55125	.071
55127	.077
55129	.078
55131	.081
55133	.072
55135	.082
55137	.082
55139	.07
55141	.074
56001	.036
56003	.082
56005	.057
56007	.068
56009	.059
56011	.049
56013	.074
56015	.053
56017	.058
56019	.067
56021	.063
56023	.065
56025	.073
56027	.045
56029	.051
56031	.062
56033	.066
56035	.045
56037	.074
56039	.052
56041	.072
56043	.059
56045	.059
72001	.217
72003	.179
72005	.178
72007	.182
72009	.192
72011	.183
72013	.167
72015	.227
72017	.201
72019	.196
72021	.136
72023	.135
72025	.158
72027	.156
72029	.212
72031	.133
72033	.183
72035	.181
72037	.176
72039	.236
72041	.173
72043	.231
72045	.234
72047	.177
72049	.116
72051	.152
72053	.178
72054	.215
72055	.199
72057	.22
72059	.226
72061	.106
72063	.163
72065	.165
72067	.164
72069	.208
72071	.191
72073	.219
72075	.186
72077	.191
72079	.186
72081	.175
72083	.181
72085	.192
72087	.204
72089	.202
72091	.192
72093	.199
72095	.259
72097	.179
72099	.18
72101	.216
72103	.232
72105	.189
72107	.228
72109	.236
72111	.202
72113	.159
72115	.168
72117	.179
72119	.171
72121	.189
72123	.252
72125	.178
72127	.119
72129	.185
72131	.182
72133	.257
72135	.129
72137	.134
72139	.111
72141	.258
72143	.163
72145	.176
72147	.277
72149	.198
72151	.241
72153	.16
@bachstatter
bachstatter commented on Dec 10, 2017
Nice work! Do you know why some states are showing up black?
They don't get any class I think the scale is returning undefined.

 @theBeesPajamas
   
 
 
Leave a comment
Attach files by dragging & dropping, selecting them, or pasting from the clipboard.

 Styling with Markdown is supported
© 2018 GitHub, Inc.
Terms
Privacy
Security
Status
Help
Contact GitHub
Pricing
API
Training
Blog
About
Press h to open a hovercard with more details.