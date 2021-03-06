/**
 * @author Varsha Kamath
 * @email varsha.kamath@stud.fra-uas.de
 * @create date 2021-01-23 21:50:38
 * @modify date 2021-01-30 19:52:41
 * @desc [Primary Smartcontract to initiate ledger with cloud details]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
let cloud = require('./cloud.js');
let initclouds = require('./initLedger.json');

class PrimaryContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initclouds.length; i++) {
            initclouds[i].docType = 'cloud';
            await ctx.stub.putState('PID' + i, Buffer.from(JSON.stringify(initclouds[i])));
            console.info('Added <--> ', initclouds[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    //Read cloud details based on cloudId
    async readcloud(ctx, cloudId) {
        const exists = await this.cloudExists(ctx, cloudId);
        if (!exists) {
            throw new Error(`The cloud ${cloudId} does not exist`);
        }

        const buffer = await ctx.stub.getState(cloudId);
        let asset = JSON.parse(buffer.toString());
        asset = ({
            cloudId: cloudId,
            firstName: asset.firstName,
            lastName: asset.lastName,
            age: asset.age,
            phoneNumber: asset.phoneNumber,
            emergPhoneNumber: asset.emergPhoneNumber,
            address: asset.address,
            bloodGroup: asset.bloodGroup,
            allergies: asset.allergies,
            symptoms: asset.symptoms,
            diagnosis: asset.diagnosis,
            treatment: asset.treatment,
            followUp: asset.followUp,
            permissionGranted: asset.permissionGranted,
            password: asset.password,
            pwdTemp: asset.pwdTemp
        });
        return asset;
    }

    async cloudExists(ctx, cloudId) {
        const buffer = await ctx.stub.getState(cloudId);
        return (!!buffer && buffer.length > 0);
    }

    async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.info('getQueryResultForQueryString <--> ', resultsIterator);
        let results = await this.getAllcloudResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    async getAllcloudResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.Timestamp = res.value.timestamp;
                }
                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }
}
module.exports = PrimaryContract;