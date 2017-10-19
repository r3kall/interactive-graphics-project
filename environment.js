/* 
 * environment.js
 * 
 * 
 */

// TODO
// createGround - praticamente già fatto
// createRoad - la più tosta, deve curvare.
// createGuardRails - recinto intorno al campo

function environment(scene) {
    return 0;
}

function createSky(scene) {
    var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x00ace6, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
}

function createGround() {}

function createRoad() {}

function createGuardRails() {}



