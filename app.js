

	
		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


		var song = document.getElementById("music");



		var renderer, scene, camera, stats;

		var object, uniforms, attributes;

		var text = "Happy Birthday Maya!!!",

			height = 15,
			size = 50,

			curveSegments = 10,
			steps = 40,

			bevelThickness = 5,
			bevelSize = 1.5,
			bevelSegments = 10,
			bevelEnabled = true,

			font = "helvetiker",	// helvetiker, optimer, gentilis, droid sans, droid serif
			weight = "bold",		// normal bold
			style = "normal";		// normal italic

		var WIDTH = window.innerWidth,
			HEIGHT = window.innerHeight;

	  var materials = []

		init();
		animate();

		function init() {

			camera = new THREE.PerspectiveCamera( 30, WIDTH / HEIGHT, 1, 10000 );
			camera.position.z = 900;

			scene = new THREE.Scene();

			attributes = {

				displacement: {	type: 'v3', value: [] },
				customColor: {	type: 'c', value: [] }

			};

			uniforms = {

				amplitude: { type: "f", value: 5.0 },
				opacity:   { type: "f", value: 0.3 },
				color:     { type: "c", value: new THREE.Color( 0xff0000 ) }

			};

			// 3D text
				// function manyStrings () {
				// 	for (var i = 0; i < 100; i++){
				// 		var textGeometry = new THREE.TextGeometry('Happy Birthday Maya!', {size:10, height:10} );
				// 		var textMaterial = new THREE.MeshLambertMaterial({color: 0xff9000});
				// 		var stringy = new THREE.Mesh( textGeometry, textMaterial);

				// 		stringy.position.x = Math.random() * 10;
				// 		stringy.position.z = Math.random() * 10;
				// 		stringy.position.y = Math.random() * 10;
				// 		stringy.rotation.x = Math.random() * 10;
				// 		stringy.rotation.z = Math.random() * 10;
				// 		scene.add( stringy );
				// 	}
				// }
				// manyStrings();


			var shaderMaterial = new THREE.ShaderMaterial( {

				uniforms:       uniforms,
				attributes:     attributes,
				vertexShader:   document.getElementById( 'vertexshader' ).textContent,
				fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
				blending:       THREE.AdditiveBlending,
				depthTest:      false,
				transparent:    true

			});

			shaderMaterial.linewidth = 1;

			geometry = new THREE.TextGeometry( text, {

				size: size,
				height: height,
				curveSegments: curveSegments,

				font: font,
				weight: weight,
				style: style,

				bevelThickness: bevelThickness,
				bevelSize: bevelSize,
				bevelEnabled: bevelEnabled,
				bevelSegments: bevelSegments,

				steps: steps

			});

			geometry.dynamic = true;

			geometry.center();

			object = new THREE.Line( geometry, shaderMaterial, THREE.LineStrip );

			var vertices = object.geometry.vertices;

			var displacement = attributes.displacement.value;
			var color = attributes.customColor.value;

			for( var v = 0; v < vertices.length; v ++ ) {

				displacement[ v ] = new THREE.Vector3();

				color[ v ] = new THREE.Color( 0xffffff );
				color[ v ].setHSL( v / vertices.length, 0.5, 0.5 );

			}

			object.rotation.x = 0.2;

			scene.add( object );

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setClearColor( 0x050505 );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( WIDTH, HEIGHT );

			var container = document.getElementById( 'container' );
			container.appendChild( renderer.domElement );

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.appendChild( stats.domElement );

			function particles() {
				geometry2 = new THREE.Geometry();

				for ( i = 0; i < 1000; i ++ ) {
					var vertex = new THREE.Vector3();
					vertex.x = Math.random() * 2000 - 1000;
					vertex.y = Math.random() * 2000 - 1000;
					vertex.z = Math.random() * 2000 - 1000;

					geometry2.vertices.push( vertex );
				}

				parameters = [
					[ [1, 1, 0.5], 5 ],
					[ [0.95, 1, 0.5], 4 ],
					[ [0.90, 1, 0.5], 3 ],
					[ [0.85, 1, 0.5], 2 ],
					[ [0.80, 1, 0.5], 1 ]
				];
				
				for ( i = 0; i < parameters.length; i ++ ) {

					color = parameters[i][0];
					size  = parameters[i][1];

					materials[i] = new THREE.PointCloudMaterial( { size: size } );

					var particles = new THREE.PointCloud( geometry2, materials[i] );

					particles.rotation.x = Math.random() * 6;
					particles.rotation.y = Math.random() * 6;
					particles.rotation.z = Math.random() * 6;

					scene.add( particles );


				}
				
			}
		particles();
		
		
		//adds in the orbit controls
		controls = new THREE.OrbitControls(camera, renderer.domElement);

			//

			window.addEventListener( 'resize', onWindowResize, false );

		}

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		function animate() {

			requestAnimationFrame( animate );

			render();
			stats.update();

		}

		function render() {

			var time = Date.now() * 0.001;

			object.rotation.y = 0.25 * time;
			
			uniforms.amplitude.value = 0.5 * Math.sin( 0.5 * time );
			uniforms.color.value.offsetHSL( 0.0005, 0, 0 );

			var nx, ny, nz, value;
			function particles(){
				//animation and color control for the particles! ripped and tweaked from  http://threejs.org/examples/webgl_particles_random.html
				for ( i = 0; i < scene.children.length; i ++ ) {
					var object2 = scene.children[ i ];
						if ( object2 instanceof THREE.PointCloud ) {
							object2.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
						}
				}

				for ( i = 0; i < materials.length; i ++ ) {
					color = parameters[i][0];
					h = ( 360 * ( color[0] + time ) % 360 ) / 360;
					materials[i].color.setHSL( h, color[1], color[2] );
				}

				for( var i = 0, il = attributes.displacement.value.length; i < il; i ++ ) {

					nx = 0.3 * ( 0.5 - Math.random() );
					ny = 0.3 * ( 0.5 - Math.random() );
					nz = 0.3 * ( 0.5 - Math.random() );

					value = attributes.displacement.value[ i ];

					value.x += nx;
					value.y += ny;
					value.z += nz;

				}
			}
			particles();

			attributes.displacement.needsUpdate = true;

			renderer.render( scene, camera );

		}


	