import {
	Vector3,
	Vector4
} from 'three';
import * as NURBSUtils from '../curves/NURBSUtils.js';

/**
 * NURBS surface object
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 **/

class NURBSSurface {

	constructor( degree1, degree2, knots1, knots2 /* arrays of reals */, controlPoints /* array^2 of Vector(2|3|4) */ ) {

		this.degree1 = degree1;
		this.degree2 = degree2;
		this.knots1 = knots1;
		this.knots2 = knots2;
		this.controlPoints = [];

		const len1 = knots1.length - degree1 - 1;
		const len2 = knots2.length - degree2 - 1;

		// ensure Vector4 for control points
		for ( let i = 0; i < len1; ++ i ) {

			this.controlPoints[ i ] = [];

			for ( let j = 0; j < len2; ++ j ) {

				const point = controlPoints[ i ][ j ];
				this.controlPoints[ i ][ j ] = new Vector4( point.x, point.y, point.z, point.w );

			}

		}

	}

	getPoint( t1, t2, target ) {

		const u = this.knots1[ 0 ] + t1 * ( this.knots1[ this.knots1.length - 1 ] - this.knots1[ 0 ] ); // linear mapping t1->u
		const v = this.knots2[ 0 ] + t2 * ( this.knots2[ this.knots2.length - 1 ] - this.knots2[ 0 ] ); // linear mapping t2->u

		NURBSUtils.calcSurfacePoint( this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, target );

	}

//calcola le tangenti alla superficie in un punto (u,v)
      getTangents( u , v ){
		var tangentu = new Vector3();
		var tangentv = new Vector3();
//		var normal = new Vector3();

	    const len1 = this.knots1.length - this.degree1 - 1;
	    const len2 = this.knots2.length - this.degree2 - 1;

//determina curva nurbs sezione (c(u)) per v assegnato
		 var cp1 = [];
		 for ( let i = 0; i < len1; ++ i ) {

         var  newpoints = [];
		 	for ( let j = 0; j < len2; ++ j ) {
		 		const point = this.controlPoints[ i ][ j ];
		 		newpoints[ j ] = new Vector4( point.x, point.y, point.z, point.w );

		 	}
		  const hpoint = NURBSUtils.calcBSplinePoint( this.degree2, this.knots2, newpoints, v );
          cp1[i] = hpoint;
		 }
//calcola la tangente alla c(u) per u assegnato
		 const der1 = NURBSUtils.calcNURBSDerivatives( this.degree1, this.knots1, cp1, u, 1 );
		 tangentu.copy( der1[ 1 ] ).normalize();

//determina curva nurbs sezione (c(v)) per u assegnato
		var cp2 = [];
		for ( let j = 0; j < len2; ++ j ) {

         var newpoints = [];
			for ( let i = 0; i < len1; ++ i ) {
				const point = this.controlPoints[ i ][ j ];
				newpoints[ i ] = new Vector4( point.x, point.y, point.z, point.w );
			}
		 const hpoint = NURBSUtils.calcBSplinePoint( this.degree1, this.knots1, newpoints, u );
         cp2[j] = hpoint;
		}
//calcola la tangente alla c(v) per v assegnato
		const der2 = NURBSUtils.calcNURBSDerivatives( this.degree2, this.knots2, cp2, v, 1 );
		tangentv.copy( der2[ 1 ] ).normalize();

	//versore Normale
//	normal.crossVectors(tangentu,tangentv);

	return {
//		normal: normal,
		tangentu: tangentu,
		tangentv: tangentv
	};
   }

//calcola la normale alla superficie in un punto (u,v)
   getNormal( u , v ){
	 var normal = new Vector3();
	 var tangents;
	 tangents = this.getTangents(u,v);
	 //versore Normale
	 normal.crossVectors(tangents.tangentu,tangents.tangentv);
	 return normal;
   }

}

export { NURBSSurface };
