// Copyright 2019 Google LLC & Asheesh Laroia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {spawnSync} = require('child_process');
const fs = require('fs');

const express = require('express');
const app = express();

// Verify the utility is available at startup instead of waiting for a first request.
let binPath = './private-from-pq';
try {
  fs.accessSync(binPath, fs.constants.X_OK);
} catch (err) {
  binPath = '/usr/local/bin/private-from-pq';
  fs.accessSync(binPath, fs.constants.X_OK);
}

app.get('/', (req, res) => {
  try {
    const response = runPrivateFromPq(req.query.p, req.query.q);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', response.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(response);
  } catch (err) {
    console.error(`error: ${err.message}`);
    const errDetails = (err.stderr || err.message).toString();
    res.setHeader('Content-Type', 'text/plain');
    res.status(400).send(`Bad Request: ${err.message}`);
  }
});
// [END run_system_package_handler]

// [START run_system_package_exec]
const runPrivateFromPq = (p, q) => {
  if (!p || !q) {
    throw new Error('syntax: missing p and/or q');
  }

  const spawned = spawnSync(binPath, ["" + p, "" + q]);
  if (spawned.status === 0 && typeof spawned.stdout.length !== 'undefined') {
    return spawned.stdout;
  } else {
    throw new Error(spawned.stderr.toString('utf-8'));
  }
};

module.exports = app;
