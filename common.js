/**
 * common.js
 * ====================================================================
 * 
 **/

/* ====================================================================
 * general purpose helpers
 * ====================================================================
 */
var Util = {

	timestamp: 		function() 					{ return new Date().getTime(); 					},
	limit:   		function(value, min, max) 	{ return Math.max(min, Math.min(value, max)); 	},
	accelerate: 	function(v, accel, dt) 		{ return v + (accel * dt); 						}
}

/* ====================================================================
 * collision detection
 * ====================================================================
 */
var Collision = {

	inside:  function(point, collidable) {
		var insideRay = new THREE.Raycaster(point, new THREE.Vector3(0, 1, 0));
        var insideResult = insideRay.intersectObject(collidable);
        if (insideResult.length > 0) return true;
        return false;
	},

	walls:  function(object, collidables) {
		var localVertex, globalVertex, externalWallRay, externalWallResults;
        var mat = new THREE.Matrix4().extractRotation(object.matrix);
        var directionVector = new THREE.Vector3(0, 0, 1).applyMatrix4(mat).normalize();

        for (var i = 0, l = object.geometry.vertices.length; i < l; i++) {        	
            localVertex = object.geometry.vertices[i].clone();
            globalVertex = localVertex.applyMatrix4(object.matrix);

            if (object.geometry.vertices[i].z > 0)
                externalWallRay = new THREE.Raycaster(globalVertex, directionVector);
            else 
                externalWallRay = new THREE.Raycaster(globalVertex, -directionVector);

            externalWallResults = externalWallRay.intersectObjects(collidables);
            if (externalWallResults.length > 0 && externalWallResults[0].distance < 1) {
                return true;
            }
        }
        return false;
	},

    onDirection:  function(point, object, collidables) {

        var mat = new THREE.Matrix4().extractRotation(object.matrix);
        var direction = new THREE.Vector3(-1, 0, 0);
        direction = direction.applyMatrix4(mat);

        var ondirectionRay = new THREE.Raycaster(point, direction.normalize());
        var ondirectionResult = ondirectionRay.intersectObjects(collidables);
        if (ondirectionResult.length > 0) return false;
        return true;
    },

    referenceLap:  function(scene) {

        function defBox() {
            var defaultPartGeometry = new THREE.BoxGeometry(1, 5, 1);
            var defaultPartMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, alphaTest: 0, visible: false});
            var defaultMesh = new THREE.Mesh(defaultPartGeometry, defaultPartMaterial);
            return defaultMesh;
        }

        var references = [];
        for (var i=0; i<3; i++)
            references.push(defBox());

        references[0].position.set(-48, SETTINGS.WORLD_POSITION['y'], 88);
        references[1].position.set(512, SETTINGS.WORLD_POSITION['y'], 16);
        references[2].position.set(232, SETTINGS.WORLD_POSITION['y'], -96);

        for (var i=0; i<3; i++)
            scene.add(references[i]);

        return references;
    },

    onLap:  function(point, object, collidables) {
        var mat = new THREE.Matrix4().extractRotation(object.matrix);
        var direction = new THREE.Vector3(-1, 0, 0);
        direction = direction.applyMatrix4(mat);

        var onLapRay = new THREE.Raycaster(point, direction.normalize(), 0, 140);
        for (var i=0; i<collidables.length; i++) {
            var onLapResult = onLapRay.intersectObject(collidables[i]);
            if (onLapResult.length > 0) return i;
        }
        
        return -1;
    }

}

/* ====================================================================
 * environment settings
 * ====================================================================
 */
 var Environment = {

    createFloor:  function(scene) {
        var floorTexture = new THREE.TextureLoader().load( 'images/grassmix.png' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set( 128, 64 );

        var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, side: THREE.BackSide } );
        var floorGeometry = new THREE.PlaneGeometry(1024, 1024, 8, 8);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);

        floor.position.set(SETTINGS.WORLD_POSITION['x'], SETTINGS.WORLD_POSITION['y'], SETTINGS.WORLD_POSITION['z']);
        floor.rotation.set(SETTINGS.WORLD_ROTATION['x'], SETTINGS.WORLD_ROTATION['y'], SETTINGS.WORLD_ROTATION['z']);

        scene.add(floor);
    },

    createSky:  function(scene) {

        var skySphere = new THREE.SphereGeometry(2048, 128, 128);
        if (night == false) {
            var skyTexture = new THREE.TextureLoader().load("images/Sky.jpg");
        } else {
            var skyTexture = new THREE.TextureLoader().load("images/night.png");
        }
        
        skyTexture.wrapS = skyTexture.wrapT = THREE.RepeatWrapping;

        var skyMaterial = new THREE.MeshBasicMaterial({map: skyTexture, side: THREE.DoubleSide});
        var skyDome = new THREE.Mesh(skySphere, skyMaterial);
        scene.add(skyDome);
    },

    createWalls:  function(scene) {
        var group = new THREE.Group();
        var texture = new THREE.TextureLoader().load( 'images/wall3.jpg' );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 128, 4 );
        var material = new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } );

        var wallAGeometry = new THREE.CubeGeometry( 560, SETTINGS.WALLS_HEIGHT, 1 );  
        wallA = new THREE.Mesh( wallAGeometry, material );
        wallA.position.set( 232, SETTINGS.WORLD_POSITION['y'], -96);

        var wallBGeometry = new THREE.CubeGeometry( 560, SETTINGS.WALLS_HEIGHT, 1 );
        wallB = new THREE.Mesh( wallBGeometry, material );
        wallB.position.set( 232, SETTINGS.WORLD_POSITION['y'], 272);

        var wallCGeometry = new THREE.CubeGeometry( 1, SETTINGS.WALLS_HEIGHT, 368 );  
        wallC = new THREE.Mesh( wallCGeometry, material );
        wallC.position.set( -48, SETTINGS.WORLD_POSITION['y'], 88);

        var wallDGeometry = new THREE.CubeGeometry( 1, SETTINGS.WALLS_HEIGHT, 368 );  
        wallD = new THREE.Mesh( wallDGeometry, material );
        wallD.position.set( 512, SETTINGS.WORLD_POSITION['y'], 88);

        group.add( wallA );
        group.add( wallB );
        group.add( wallC );
        group.add( wallD );
        scene.add( group );
        return group;
    },


    createIWalls:  function(scene) {
        var igroup = new THREE.Group();
        var texture = new THREE.TextureLoader().load( 'images/wall2.jpg' );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 2 );
        var material = new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } );

        var iwallAGeometry = new THREE.CubeGeometry(390, SETTINGS.WALLS_HEIGHT, 1);
        iwallN = new THREE.Mesh(iwallAGeometry, material);
        iwallN.position.set(220, SETTINGS.WORLD_POSITION['y'], -40);

        var iwallBGeometry = new THREE.CubeGeometry(50, SETTINGS.WALLS_HEIGHT, 1);
        iwallS = new THREE.Mesh(iwallBGeometry, material);
        iwallS.position.set(50, SETTINGS.WORLD_POSITION['y'], 220);
        var iwallB2Geometry = new THREE.CubeGeometry(340, SETTINGS.WALLS_HEIGHT, 1);
        iwallS2 = new THREE.Mesh(iwallB2Geometry, material);
        iwallS2.position.set(245, SETTINGS.WORLD_POSITION['y'], 80);

        var iwallCGeometry = new THREE.CubeGeometry(1, SETTINGS.WALLS_HEIGHT, 260);
        iwallW = new THREE.Mesh(iwallCGeometry, material);
        iwallW.position.set(25, SETTINGS.WORLD_POSITION['y'], 90);
        iwallW2 = iwallW.clone();
        iwallW2.position.set(75, SETTINGS.WORLD_POSITION['y'], 90);

        var iwallDGeometry = new THREE.CubeGeometry(1, SETTINGS.WALLS_HEIGHT, 120);
        iwallE = new THREE.Mesh(iwallDGeometry, material);
        iwallE.position.set(415, SETTINGS.WORLD_POSITION['y'], 20);

        igroup.add(iwallN);
        igroup.add(iwallS);
        igroup.add(iwallS2);
        igroup.add(iwallW);
        igroup.add(iwallW2);
        igroup.add(iwallE);
        scene.add(igroup);
        return igroup;
    },

    createCity:  function(scene) {

        var building = new THREE.CubeGeometry(9, 20, 9);
        building.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
        var buildingMesh = new THREE.Mesh(building);

        var blight = new THREE.Color(0xffffff);
        var bshadow = new THREE.Color(0x303050);

        var cityGeometry = new THREE.Geometry();

        // establish the base color for the buildingMesh
        var bvalue = 1 - Math.random() * Math.random();
        var baseColor = new THREE.Color().setRGB(bvalue + Math.random() * 0.1, bvalue, bvalue + Math.random() * 0.1);
        // set topColor/bottom vertexColors as adjustement of baseColor
        var topColor = baseColor.clone().multiply(blight);
        var bottomColor = baseColor.clone().multiply(bshadow);
        // set .vertexColors for each face
        var bgeometry = buildingMesh.geometry;
        for (var j = 0, jl = bgeometry.faces.length; j < jl; j++) {
            if (j === 2) {
                // set face.vertexColors on root face
                bgeometry.faces[j].vertexColors = [baseColor, baseColor, baseColor, baseColor];
            } else {
                // set face.vertexColors on sides faces
                bgeometry.faces[j].vertexColors = [topColor, bottomColor, bottomColor, topColor];
            }
        }

        buildingMesh.updateMatrix();
        cityGeometry.merge(buildingMesh.geometry, buildingMesh.matrix);

        var btexture = new THREE.Texture(generateTexture());
        btexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        btexture.needsUpdate = true;

        // build the mesh
        var bmaterial = new THREE.MeshLambertMaterial({
            map: btexture,
            vertexColors: THREE.VertexColors
        });
        cityMesh = new THREE.Mesh(cityGeometry, bmaterial);

        function generateTexture() {
            // build a small canvas 32x64 and paint it in white
            var canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 64;
            var context = canvas.getContext('2d');
            // plain it in white
            context.fillStyle = '#A3A3A3';
            context.fillRect(0, 0, 32, 64);
            // draw the window rows - with a small noise to simulate light variations in each room
            for (var y = 2; y < 64; y += 2) {
                for (var x = 0; x < 32; x += 2) {
                    var value = Math.floor(Math.random() * 64);
                    context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')';
                    context.fillRect(x, y, 2, 1);
                }
            }

            // build a bigger canvas and copy the small one in it
            // This is a trick to upscale the texture without filtering
            var canvas2 = document.createElement('canvas');
            canvas2.width = 512;
            canvas2.height = 1024;
            var context = canvas2.getContext('2d');
            // disable smoothing
            context.imageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.ImageSmoothingEnabled = false;
            // then draw the image
            context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
            // return the just built canvas2
            return canvas2;
        }

        //CREATE MULTIPLE DUILDING
        var city = new THREE.Group();
        var i = 1;

        for (var z = -30; z < 71; z += 25) {
            for (var x = 40; x < 401; x += 36) {
                var cityMesh2 = cityMesh.clone();
                cityMesh2.position.set(x, 0, z);
                city.add(cityMesh2);
            }
        }

        for (var z = 90; z < 211; z += 20) {
            for (var x = 40; x < 71; x += 15) {
                var cityMesh2 = cityMesh.clone();
                cityMesh2.position.set(x, 0, z);
                city.add(cityMesh2);
            }
        }

        scene.add(city); 
    },

    createTrack:  function(scene) {
        var trackShape = new THREE.Shape();
        trackShape.moveTo( 20, -40 );
        trackShape.lineTo( 200, -40 );
        trackShape.absarc( 200, 10, 50, -Math.PI/2, Math.PI/2, false );
        trackShape.lineTo( 80, 60 );
        trackShape.absarc( 80, 80, 20, -Math.PI/2, Math.PI, true );
        trackShape.lineTo( 60, 90 );
        trackShape.absarc( 20, 90, 40, 0, Math.PI, false );
        trackShape.lineTo( -20, 0 );
        trackShape.absarc( 20, 0, 40, Math.PI, -Math.PI/2,false );
        trackShape.lineTo( 20, -40 );

        var hole = new THREE.Path();
        hole.moveTo( 20, -30 );
        hole.lineTo( 200, -30 );
        hole.absarc( 200, 10, 40, -Math.PI/2, Math.PI/2, false );
        hole.lineTo( 80, 50 );
        hole.absarc( 80, 80, 30, -Math.PI/2, Math.PI, true );
        hole.lineTo( 50, 90 );
        hole.absarc( 20, 90, 30, 0, Math.PI, false );
        hole.lineTo( -10, 0 );
        hole.absarc( 20, 0, 30, Math.PI, -Math.PI/2,false );
        trackShape.holes.push(hole);

        var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

        var texture = new THREE.TextureLoader().load( 'images/road1.jpg' );
        //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 64, 64 );

        var geometry = new THREE.ShapeBufferGeometry( trackShape );
        var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { map: texture, side: THREE.DoubleSide} ) );

        mesh.position.set(SETTINGS.TRACK_POSITION['x'], SETTINGS.TRACK_POSITION['y'], SETTINGS.TRACK_POSITION['z']);
        mesh.rotation.set(SETTINGS.WORLD_ROTATION['x'], SETTINGS.WORLD_ROTATION['y'], SETTINGS.WORLD_ROTATION['z']);
        mesh.scale.set(SETTINGS.TRACK_SCALE['x'], SETTINGS.TRACK_SCALE['y'], SETTINGS.TRACK_SCALE['z']);
        scene.add(mesh);
        return mesh;
    },

    createLine:  function(scene) {
        var lineTexture = new THREE.TextureLoader().load( 'images/check.jpg' );
        lineTexture.wrapS = lineTexture.wrapT = THREE.RepeatWrapping;
        lineTexture.repeat.set( 8, 1 );

        var lineMaterial = new THREE.MeshLambertMaterial( { map: lineTexture, side: THREE.BackSide} );
        //var lineGeometry = new THREE.PlaneGeometry(20, 2);
        var lineGeometry = new THREE.BoxGeometry(20, 2, 0.000001);
        var line = new THREE.Mesh(lineGeometry, lineMaterial);

        line.position.set(SETTINGS.LINE_POSITION['x'], SETTINGS.LINE_POSITION['y'], SETTINGS.LINE_POSITION['z']);
        line.rotation.set(SETTINGS.WORLD_ROTATION['x'], SETTINGS.WORLD_ROTATION['y'], SETTINGS.WORLD_ROTATION['z']);

        scene.add(line);
        return line;
    },

    createTrees:  function(scene) {
        function createTree(x, y, z) {
            geometry = new THREE.BoxGeometry( 1, 1, 1 );

            var leaveDarkMaterial = new THREE.MeshLambertMaterial( { color: 0x91E56E } );
            var leaveLightMaterial = new THREE.MeshLambertMaterial( { color: 0xA2FF7A } );
            var leaveDarkDarkMaterial = new THREE.MeshLambertMaterial( { color: 0x71B356 } );
            var stemMaterial = new THREE.MeshLambertMaterial( { color: 0x7D5A4F } );

            var stem = new THREE.Mesh( geometry, stemMaterial );
            stem.position.set( 0, 0, 0 );
            stem.scale.set( 0.3, 1.5, 0.3 );

            var squareLeave01 = new THREE.Mesh( geometry, leaveDarkMaterial );
            squareLeave01.position.set( 0.5, 1.6, 0.5 );
            squareLeave01.scale.set( 0.8, 0.8, 0.8 );

            var squareLeave02 = new THREE.Mesh( geometry, leaveDarkMaterial );
            squareLeave02.position.set( -0.4, 1.3, -0.4 );
            squareLeave02.scale.set( 0.7, 0.7, 0.7 );

            var squareLeave03 = new THREE.Mesh( geometry, leaveDarkMaterial );
            squareLeave03.position.set( 0.4, 1.7, -0.5 );
            squareLeave03.scale.set( 0.7, 0.7, 0.7 );

            var leaveDark = new THREE.Mesh( geometry, leaveDarkMaterial );
            leaveDark.position.set( 0, 1.2, 0 );
            leaveDark.scale.set( 1, 2, 1 );

            var leaveLight = new THREE.Mesh( geometry, leaveLightMaterial );
            leaveLight.position.set( 0, 1.2, 0 );
            leaveLight.scale.set( 1.1, 0.5, 1.1 );

            tree = new THREE.Group();
            tree.add( leaveDark );
            tree.add( leaveLight );
            tree.add( squareLeave01 );
            tree.add( squareLeave02 );
            tree.add( squareLeave03 );
            tree.add( stem );
            tree.position.set(x, y, z);

            return tree;
        }

        var xStart = 200;
        var zStart = 200;
        var xLimit = 500;
        var zLimit = 270;
        var xOffset = 1;
        var zOffset = 1;

        var trees = new THREE.Group();
        while (xStart + xOffset < xLimit) {
            var zR = Math.random();
            while (zStart + zOffset < zLimit) {
                trees.add(createTree(xStart+xOffset, 0, zStart+zOffset));
                if (Math.random() < 0.05) zOffset += zR + 4;
                else zOffset += zR + Math.random();
            }
            xOffset += 1;
        }

        scene.add(trees);
    },

    createTower:  function(scene) {
        var texture = new THREE.TextureLoader().load( 'images/brick.jpg' );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 8, 8 );

        var material = new THREE.MeshLambertMaterial( { map: texture } );
        var geometry = new THREE.CylinderGeometry(12, 12, 32, 32, 32);
        var tower = new THREE.Mesh(geometry, material);
        tower.position.set(180, SETTINGS.WORLD_POSITION['y'], 180);

        scene.add(tower);
    }
 }

var SETTINGS = {
    WORLD_POSITION  :   {x:         0, y:  -0.5, z: 0},
    WORLD_ROTATION  :   {x: Math.PI/2, y:     0, z: 0},
    TRACK_POSITION  :   {x:         0, y: -0.45, z: 0},
    TRACK_SCALE     :   {x:         2, y:     2, z: 2},
    LINE_POSITION   :   {x:       -30, y: -0.42, z: 10},
    WALLS_HEIGHT    :   5,

}
