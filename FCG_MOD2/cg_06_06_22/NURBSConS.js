import {
	Curve,
	Vector3,
	Vector4
} from 'three';
import * as NURBSUtils from '../curves/NURBSUtils.js';

/**
 * NURBS Curve on  Surface object
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 **/
class NURBSConS extends Curve {

	constructor( degree1, degree2, knots1, knots2 /* arrays of reals */, controlPoints /* array^2 of Vector(2|3|4) */,
	degree,
	knots /* array of reals */,
	cPs /* array of Vector(2) */,
	startKnot /* index in knots */,
	endKnot /* index in knots */ ) {

		super();

		this.degree = degree;
		this.knots = knots;
		this.cPs = [];
		// Used by periodic NURBS to remove hidden spans
		this.startKnot = startKnot || 0;
		this.endKnot = endKnot || ( this.knots.length - 1 );

		for ( let i = 0; i < cPs.length; ++ i ) {

			// ensure Vector4 for control points
			const point = cPs[ i ];
			this.cPs[ i ] = new Vector4( point.x, point.y, point.z, point.w );

		}

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

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const s = this.knots[ this.startKnot ] + t * ( this.knots[ this.endKnot ] - this.knots[ this.startKnot ] ); // linear mapping t->s

		// following results in (wx, wy, wz, w) homogeneous point
		const hpoint = NURBSUtils.calcBSplinePoint( this.degree, this.knots, this.cPs, s );

		if ( hpoint.w !== 1.0 ) {

			// project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
			hpoint.divideScalar( hpoint.w );

		}

	//	return point.set( hpoint.x, hpoint.y );

		const u = this.knots1[ 0 ] + hpoint.x * ( this.knots1[ this.knots1.length - 1 ] - this.knots1[ 0 ] ); // linear mapping t1->u
		const v = this.knots2[ 0 ] + hpoint.y * ( this.knots2[ this.knots2.length - 1 ] - this.knots2[ 0 ] ); // linear mapping t2->u

		NURBSUtils.calcSurfacePoint( this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, optionalTarget );

		return point.set( point.x, point.y, point.z );
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

//calcola tangente, binormale e normale in un
//punto della curva sulla superficie;
computeFrenetFrames( u ){
	//vettori in cui vengono calcolati i vettori suddetti
	//var C0 = new Vector3();
	var C1 = new Vector3();
	var C2 = new Vector3();
	var CT = new Vector3();
	const tangent = new Vector3();
	const normal = new Vector3();
	const binormal = new Vector3();

	const ders = NURBSUtils.calcNURBSDerivatives( this.degree, this.knots, this.cPs, u, 1 );

	var ST=this.getTangents( ders[0].x , ders[0].y );

	C1.copy( ST.tangentu );
	C2.copy( ST.tangentv );
	
	//versore Tangente
    CT.x = C1.x*ders[1].x+C2.x*ders[1].y;
    CT.y = C1.y*ders[1].x+C2.y*ders[1].y;
    CT.z = C1.z*ders[1].x+C2.z*ders[1].y;
	tangent.copy(CT).normalize();

	//versore Normale alla superficie
	normal.crossVectors(C1,C2);

    //versore Normale alla cons o binormale
	binormal.crossVectors(normal,tangent);
	binormal.normalize();

	return {
		tangents: tangent,
		normals: normal,
		binormals: binormal
	};
  }

}

export { NURBSConS };
