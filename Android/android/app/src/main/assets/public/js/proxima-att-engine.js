// ====================================================
// QUANTUM MATH — Cálculo rigoroso de |ψ_nlm|²
// ====================================================
function fact(n) {
    if(n<=1) return 1;
    let r=1; for(let i=2;i<=n;i++) r*=i; return r;
}

function laguerreAssoc(n, alpha, x) {
    if(n===0) return 1;
    if(n===1) return 1+alpha-x;
    let L0=1, L1=1+alpha-x, Lk=0;
    for(let k=2;k<=n;k++){
        Lk=((2*k-1+alpha-x)*L1-(k-1+alpha)*L0)/k;
        L0=L1; L1=Lk;
    }
    return Lk;
}

function legendreAssoc(l, m, x) {
    let pmm=1;
    if(m>0){
        let somx2=Math.sqrt((1-x)*(1+x));
        let fact_val=1;
        for(let i=1;i<=m;i++){
            pmm*=(-1)*fact_val*somx2; fact_val+=2;
        }
    }
    if(l===m) return pmm;
    let pmmp1=x*(2*m+1)*pmm;
    if(l===m+1) return pmmp1;
    let pll=0;
    for(let ll=m+2;ll<=l;ll++){
        pll=((2*ll-1)*x*pmmp1-(ll+m-1)*pmm)/(ll-m);
        pmm=pmmp1; pmmp1=pll;
    }
    return pll;
}

function radialWF(n, l, r, Z) {
    const a0=1;
    const rho=2*Z*r/(n*a0);
    const num=fact(n-l-1);
    const den=2*n*fact(n+l);
    const norm=Math.sqrt(Math.pow(2*Z/(n*a0),3)*num/den);
    const laguerre=laguerreAssoc(n-l-1, 2*l+1, rho);
    return norm*Math.exp(-rho/2)*Math.pow(rho,l)*laguerre;
}

function sphericalHarmonic(l, m, theta, phi) {
    const cosT=Math.cos(theta);
    const am=Math.abs(m);
    const Plm=legendreAssoc(l,am,cosT);
    const norm=Math.sqrt((2*l+1)/(4*Math.PI)*fact(l-am)/fact(l+am));
    if(m===0) return norm*Plm;
    if(m>0) return Math.SQRT2*norm*Plm*Math.cos(m*phi);
    return Math.SQRT2*norm*Plm*Math.sin(-m*phi);
}

function psi2(n, l, m, x, y, z) {
    const r=Math.sqrt(x*x+y*y+z*z);
    if(r<1e-10) return (l===0)?Math.pow(radialWF(n,0,1e-10,1)*sphericalHarmonic(0,0,0,0),2):0;
    const theta=Math.acos(Math.max(-1,Math.min(1,z/r)));
    const phi=Math.atan2(y,x);
    const R=radialWF(n,l,r,1);
    const Y=sphericalHarmonic(l,m,theta,phi);
    return R*R*Y*Y;
}

// ====================================================
// MARCHING CUBES — completo
// ====================================================
const edgeTable=[0,273,545,816,2082,2323,2611,2880,1042,1283,1587,1826,3120,3329,3649,3920,324,85,869,628,2406,2167,2983,2740,1366,1127,1943,1700,3444,3173,4021,3748,644,917,165,436,2722,2963,2227,2466,1686,1927,1207,1446,3764,3973,3285,3492,960,801,549,388,3006,2815,2579,2416,2006,1815,1595,1432,4064,3841,3685,3460,2060,2269,2577,2884,14,223,527,800,3102,3279,3615,3920,1054,1231,1583,1824,1096,1305,1629,1836,338,115,467,272,3402,3179,3567,3340,1394,1139,1559,1304,1416,1161,1597,1340,692,965,213,484,2770,3011,2275,2514,1734,1975,1255,1494,1768,1977,1313,1520,1008,849,597,436,3054,2863,2627,2464,2038,1815,1627,1432,4076,3853,3697,3472,2144,2417,2721,2992,170,411,731,1000,3186,3427,3763,4032,1238,1447,1783,2020,3408,3537,3793,3984,464,273,53,860,2530,2307,2123,1932,1478,1255,1087,862,3576,3321,3209,3016,788,1061,309,580,2834,3043,2307,2578,1782,2023,1303,1510,3816,4025,3337,3544,1104,945,693,532,3150,2959,2723,2560,2118,1895,1675,1480,4152,3929,3773,3548,2276,2485,2793,3068,346,523,859,1096,3258,3435,3803,4008,1350,1495,1863,2068,3576,3721,4025,4232,1172,1045,801,740,2618,2459,2251,2156,1594,1435,1259,1196,3720,3529,3417,3288,1428,1669,917,1156,2970,3179,2443,2714,1958,2167,1447,1686,3984,4161,3513,3752,1744,1553,1301,1108,3790,3567,3347,3188,2726,2471,2283,2092,4804,4549,4393,4200];

const triTable=[[-1],[0,8,3,-1],[0,1,9,-1],[1,8,3,9,8,1,-1],[1,2,10,-1],[0,8,3,1,2,10,-1],[9,2,10,0,2,9,-1],[2,8,3,2,10,8,10,9,8,-1],[3,11,2,-1],[0,11,2,8,11,0,-1],[1,9,0,2,3,11,-1],[1,11,2,1,9,11,9,8,11,-1],[3,10,1,11,10,3,-1],[0,10,1,0,8,10,8,11,10,-1],[3,9,0,3,11,9,11,10,9,-1],[9,8,10,10,8,11,-1],[4,7,8,-1],[4,3,0,7,3,4,-1],[0,1,9,8,4,7,-1],[4,1,9,4,7,1,7,3,1,-1],[1,2,10,8,4,7,-1],[3,4,7,3,0,4,1,2,10,-1],[9,2,10,9,0,2,8,4,7,-1],[2,10,9,2,9,7,7,9,4,3,2,7,-1],[8,4,7,3,11,2,-1],[11,4,7,11,2,4,2,0,4,-1],[9,0,1,8,4,7,2,3,11,-1],[4,7,11,9,4,11,9,11,2,9,2,1,-1],[3,10,1,3,11,10,7,8,4,-1],[1,11,10,1,4,11,1,0,4,7,11,4,-1],[4,7,8,9,0,11,9,11,10,11,0,3,-1],[4,7,11,4,11,9,9,11,10,-1],[9,5,4,-1],[9,5,4,0,8,3,-1],[0,5,4,1,5,0,-1],[8,5,4,8,3,5,3,1,5,-1],[1,2,10,9,5,4,-1],[3,0,8,1,2,10,4,9,5,-1],[5,2,10,5,4,2,4,0,2,-1],[2,10,5,3,2,5,3,5,4,3,4,8,-1],[9,5,4,2,3,11,-1],[0,11,2,0,8,11,4,9,5,-1],[0,5,4,0,1,5,2,3,11,-1],[2,1,5,2,5,8,2,8,11,4,8,5,-1],[10,3,11,10,1,3,9,5,4,-1],[4,9,5,0,8,1,8,10,1,8,11,10,-1],[5,4,0,5,0,11,5,11,10,11,0,3,-1],[5,4,8,5,8,10,10,8,11,-1],[9,7,8,5,7,9,-1],[9,3,0,9,5,3,5,7,3,-1],[0,7,8,0,1,7,1,5,7,-1],[1,5,3,3,5,7,-1],[9,7,8,9,5,7,10,1,2,-1],[10,1,2,9,5,0,5,3,0,5,7,3,-1],[8,0,2,8,2,5,8,5,7,10,5,2,-1],[2,10,5,2,5,3,3,5,7,-1],[7,9,5,7,8,9,3,11,2,-1],[9,5,7,9,7,2,9,2,0,2,7,11,-1],[2,3,11,0,1,8,1,7,8,1,5,7,-1],[11,2,1,11,1,7,7,1,5,-1],[9,5,8,8,5,7,10,1,3,10,3,11,-1],[5,7,0,5,0,9,7,11,0,1,0,10,11,10,0,-1],[11,10,0,11,0,3,10,5,0,8,0,7,5,7,0,-1],[11,10,5,7,11,5,-1],[10,6,5,-1],[0,8,3,5,10,6,-1],[9,0,1,5,10,6,-1],[1,8,3,1,9,8,5,10,6,-1],[1,6,5,2,6,1,-1],[1,6,5,1,2,6,3,0,8,-1],[9,6,5,9,0,6,0,2,6,-1],[5,9,8,5,8,2,5,2,6,3,2,8,-1],[2,3,11,10,6,5,-1],[11,0,8,11,2,0,10,6,5,-1],[0,1,9,2,3,11,5,10,6,-1],[5,10,6,1,9,2,9,11,2,9,8,11,-1],[3,6,5,3,11,6,1,3,5,-1],[0,8,11,0,11,6,0,6,1,5,1,6,-1],[3,11,6,0,3,6,0,6,5,0,5,9,-1],[6,5,9,6,9,11,11,9,8,-1],[5,10,6,4,7,8,-1],[4,3,0,4,7,3,6,5,10,-1],[1,9,0,5,10,6,8,4,7,-1],[10,6,5,1,9,7,1,7,3,7,9,4,-1],[6,1,2,6,5,1,4,7,8,-1],[1,2,5,5,2,6,3,0,4,3,4,7,-1],[8,4,7,9,0,5,0,6,5,0,2,6,-1],[7,3,9,7,9,4,3,2,9,5,9,6,2,6,9,-1],[3,11,2,7,8,4,10,6,5,-1],[5,10,6,4,7,2,4,2,0,2,7,11,-1],[0,1,9,4,7,8,2,3,11,5,10,6,-1],[9,2,1,9,11,2,9,4,11,7,11,4,5,10,6,-1],[8,4,7,3,11,5,3,5,1,5,11,6,-1],[5,1,11,5,11,6,1,0,11,7,11,4,0,4,11,-1],[0,5,9,0,6,5,0,3,6,11,6,3,8,4,7,-1],[6,5,9,6,9,11,4,7,9,7,11,9,-1],[10,4,9,6,4,10,-1],[4,10,6,4,9,10,0,8,3,-1],[10,0,1,10,6,0,6,4,0,-1],[8,3,1,8,1,6,8,6,4,6,1,10,-1],[1,4,9,1,2,4,2,6,4,-1],[3,0,8,1,2,9,2,4,9,2,6,4,-1],[0,2,4,4,2,6,-1],[8,3,2,8,2,4,4,2,6,-1],[10,4,9,10,6,4,11,2,3,-1],[0,8,2,2,8,11,4,9,10,4,10,6,-1],[3,11,2,0,1,6,0,6,4,6,1,10,-1],[6,4,1,6,1,10,4,8,1,2,1,11,8,11,1,-1],[9,6,4,9,3,6,9,1,3,11,6,3,-1],[8,11,1,8,1,0,11,6,1,9,1,4,6,4,1,-1],[3,11,6,3,6,0,0,6,4,-1],[6,4,8,11,6,8,-1],[7,10,6,7,8,10,8,9,10,-1],[0,7,3,0,10,7,0,9,10,6,7,10,-1],[10,6,7,1,10,7,1,7,8,1,8,0,-1],[10,6,7,10,7,1,1,7,3,-1],[1,2,6,1,6,8,1,8,9,8,6,7,-1],[2,6,9,2,9,1,6,7,9,0,9,3,7,3,9,-1],[7,8,0,7,0,6,6,0,2,-1],[7,3,2,6,7,2,-1],[2,3,11,10,6,8,10,8,9,8,6,7,-1],[2,0,7,2,7,11,0,9,7,6,7,10,9,10,7,-1],[1,8,0,1,7,8,1,10,7,6,7,10,2,3,11,-1],[11,2,1,11,1,7,10,6,1,6,7,1,-1],[8,9,6,8,6,7,9,1,6,11,6,3,1,3,6,-1],[0,9,1,11,6,7,-1],[7,8,0,7,0,6,3,11,0,11,6,0,-1],[7,11,6,-1],[7,6,11,-1],[3,0,8,11,7,6,-1],[0,1,9,11,7,6,-1],[8,1,9,8,3,1,11,7,6,-1],[10,1,2,6,11,7,-1],[1,2,10,3,0,8,6,11,7,-1],[2,9,0,2,10,9,6,11,7,-1],[6,11,7,2,10,3,10,8,3,10,9,8,-1],[7,2,3,6,2,7,-1],[7,0,8,7,6,0,6,2,0,-1],[2,7,6,2,3,7,0,1,9,-1],[1,6,2,1,8,6,1,9,8,8,7,6,-1],[10,7,6,10,1,7,1,3,7,-1],[10,7,6,1,7,10,1,8,7,1,0,8,-1],[0,3,7,0,7,10,0,10,9,6,10,7,-1],[7,6,10,7,10,8,8,10,9,-1],[6,8,4,11,8,6,-1],[3,6,11,3,0,6,0,4,6,-1],[8,6,11,8,4,6,9,0,1,-1],[9,4,6,9,6,3,9,3,1,11,3,6,-1],[6,8,4,6,11,8,2,10,1,-1],[1,2,10,3,0,11,0,6,11,0,4,6,-1],[4,11,8,4,6,11,0,2,9,2,10,9,-1],[10,9,3,10,3,2,9,4,3,11,3,6,4,6,3,-1],[8,2,3,8,4,2,4,6,2,-1],[0,4,2,4,6,2,-1],[1,9,0,2,3,4,2,4,6,4,3,8,-1],[1,9,4,1,4,2,2,4,6,-1],[8,1,3,8,6,1,8,4,6,6,10,1,-1],[10,1,0,10,0,6,6,0,4,-1],[4,6,3,4,3,8,6,10,3,0,3,9,10,9,3,-1],[10,9,4,6,10,4,-1],[4,9,5,7,6,11,-1],[0,8,3,4,9,5,11,7,6,-1],[5,0,1,5,4,0,7,6,11,-1],[11,7,6,8,3,4,3,5,4,3,1,5,-1],[9,5,4,10,1,2,7,6,11,-1],[6,11,7,1,2,10,0,8,3,4,9,5,-1],[7,6,11,5,4,10,4,2,10,4,0,2,-1],[3,4,8,3,5,4,3,2,5,10,5,2,11,7,6,-1],[7,2,3,7,6,2,5,4,9,-1],[9,5,4,0,8,6,0,6,2,6,8,7,-1],[3,6,2,3,7,6,1,5,0,5,4,0,-1],[6,2,8,6,8,7,2,1,8,4,8,5,1,5,8,-1],[9,5,4,10,1,6,1,7,6,1,3,7,-1],[1,6,10,1,7,6,1,0,7,8,7,0,9,5,4,-1],[4,0,10,4,10,5,0,3,10,6,10,7,3,7,10,-1],[7,6,10,7,10,8,5,4,10,4,8,10,-1],[6,9,5,6,11,9,11,8,9,-1],[3,6,11,0,6,3,0,5,6,0,9,5,-1],[0,11,8,0,5,11,0,1,5,5,6,11,-1],[6,11,3,6,3,5,5,3,1,-1],[1,2,10,9,5,11,9,11,8,11,5,6,-1],[0,11,3,0,6,11,0,9,6,5,6,9,1,2,10,-1],[11,8,5,11,5,6,8,0,5,10,5,2,0,2,5,-1],[6,11,3,6,3,5,2,10,3,10,5,3,-1],[5,8,9,5,2,8,5,6,2,3,8,2,-1],[9,5,6,9,6,0,0,6,2,-1],[1,5,8,1,8,0,5,6,8,3,8,2,6,2,8,-1],[1,5,6,2,1,6,-1],[1,3,6,1,6,10,3,8,6,5,6,9,8,9,6,-1],[10,1,0,10,0,6,9,5,0,5,6,0,-1],[0,3,8,5,6,10,-1],[10,5,6,-1],[11,5,10,7,5,11,-1],[11,5,10,11,7,5,8,3,0,-1],[5,11,7,5,10,11,1,9,0,-1],[10,7,5,10,11,7,9,8,1,8,3,1,-1],[11,1,2,11,7,1,7,5,1,-1],[0,8,3,1,2,7,1,7,5,7,2,11,-1],[9,7,5,9,2,7,9,0,2,2,11,7,-1],[7,5,2,7,2,11,5,9,2,3,2,8,9,8,2,-1],[2,5,10,2,3,5,3,7,5,-1],[8,2,0,8,5,2,8,7,5,10,2,5,-1],[9,0,1,2,3,5,2,5,10,5,3,7,-1],[9,8,2,9,2,1,8,7,2,10,2,5,7,5,2,-1],[1,3,5,3,7,5,-1],[0,8,7,0,7,1,1,7,5,-1],[9,0,3,9,3,5,5,3,7,-1],[9,8,7,5,9,7,-1],[5,8,4,5,10,8,10,11,8,-1],[5,0,4,5,11,0,5,10,11,11,3,0,-1],[0,1,9,8,4,10,8,10,11,10,4,5,-1],[10,11,4,10,4,5,11,3,4,9,4,1,3,1,4,-1],[2,5,1,2,8,5,2,11,8,4,5,8,-1],[0,4,11,0,11,3,4,5,11,2,11,1,5,1,11,-1],[0,2,5,0,5,9,2,11,5,4,5,8,11,8,5,-1],[9,4,5,2,11,3,-1],[2,5,10,3,5,2,3,4,5,3,8,4,-1],[5,10,2,5,2,4,4,2,0,-1],[3,10,2,3,5,10,3,8,5,4,5,8,0,1,9,-1],[5,10,2,5,2,4,1,9,2,9,4,2,-1],[8,4,5,8,5,3,3,5,1,-1],[0,4,5,1,0,5,-1],[8,4,5,8,5,3,9,0,5,0,3,5,-1],[9,4,5,-1],[4,11,7,4,9,11,9,10,11,-1],[0,8,3,4,9,7,9,11,7,9,10,11,-1],[1,10,11,1,11,4,1,4,0,7,4,11,-1],[3,1,4,3,4,8,1,10,4,7,4,11,10,11,4,-1],[4,11,7,9,11,4,9,2,11,9,1,2,-1],[9,7,4,9,11,7,9,1,11,2,11,1,0,8,3,-1],[11,7,4,11,4,2,2,4,0,-1],[11,7,4,11,4,2,8,3,4,3,2,4,-1],[2,9,10,2,7,9,2,3,7,7,4,9,-1],[9,10,7,9,7,4,10,2,7,8,7,0,2,0,7,-1],[3,7,10,3,10,2,7,4,10,1,10,0,4,0,10,-1],[1,10,2,8,7,4,-1],[4,9,1,4,1,7,7,1,3,-1],[4,9,1,4,1,7,0,8,1,8,7,1,-1],[4,0,3,7,4,3,-1],[4,8,7,-1],[9,10,8,10,11,8,-1],[3,0,9,3,9,11,11,9,10,-1],[0,1,10,0,10,8,8,10,11,-1],[3,1,10,11,3,10,-1],[1,2,11,1,11,9,9,11,8,-1],[3,0,9,3,9,11,1,2,9,2,11,9,-1],[0,2,11,8,0,11,-1],[3,2,11,-1],[2,3,8,2,8,10,10,8,9,-1],[9,10,2,0,9,2,-1],[2,3,8,2,8,10,0,1,8,1,10,8,-1],[1,10,2,-1],[1,3,8,9,1,8,-1],[0,9,1,-1],[0,3,8,-1],[-1]];

function marchingCubes(data, GRID, scale, isoVal) {
    const verts=[], normals=[];
    function idx(ix,iy,iz){ return ix+iy*GRID+iz*GRID*GRID; }
    function pos(i,s){ return (i/(GRID-1)-0.5)*2*s; }
    function interp(p1,p2,v1,v2){
        if(Math.abs(v1-v2)<1e-10) return (p1+p2)/2;
        return p1+(isoVal-v1)*(p2-p1)/(v2-v1);
    }
    const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    for(let ix=0;ix<GRID-1;ix++){
    for(let iy=0;iy<GRID-1;iy++){
    for(let iz=0;iz<GRID-1;iz++){
        const cx=[ix,ix+1,ix+1,ix,ix,ix+1,ix+1,ix];
        const cy=[iy,iy,iy+1,iy+1,iy,iy,iy+1,iy+1];
        const cz=[iz,iz,iz,iz,iz+1,iz+1,iz+1,iz+1];
        const vals=cx.map((_,i)=>data[idx(cx[i],cy[i],cz[i])]);
        let cubeIdx=0;
        for(let i=0;i<8;i++) if(vals[i]>=isoVal) cubeIdx|=(1<<i);
        if(cubeIdx===0||cubeIdx===255) continue;
        const eTable=edgeTable[cubeIdx];
        if(eTable===0) continue;
        const ev=[];
        for(let e=0;e<12;e++){
            if(eTable&(1<<e)){
                const [a,b]=edges[e];
                ev[e]=[
                    interp(pos(cx[a],scale),pos(cx[b],scale),vals[a],vals[b]),
                    interp(pos(cy[a],scale),pos(cy[b],scale),vals[a],vals[b]),
                    interp(pos(cz[a],scale),pos(cz[b],scale),vals[a],vals[b])
                ];
            }
        }
        const tri=triTable[cubeIdx];
        for(let t=0;t<tri.length;t+=3){
            if(tri[t]===-1) break;
            const v0=ev[tri[t]], v1=ev[tri[t+1]], v2=ev[tri[t+2]];
            if(!v0||!v1||!v2) continue;
            verts.push(...v0,...v1,...v2);
            const ax=v1[0]-v0[0],ay=v1[1]-v0[1],az=v1[2]-v0[2];
            const bx=v2[0]-v0[0],by=v2[1]-v0[1],bz=v2[2]-v0[2];
            const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
            const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
            normals.push(nx/nl,ny/nl,nz/nl,nx/nl,ny/nl,nz/nl,nx/nl,ny/nl,nz/nl);
        }
    }}}
    const n=verts.length/3;
    const faces=new Uint32Array(n); for(let i=0;i<n;i++) faces[i]=i;
    return {verts:new Float32Array(verts), faces, normals:new Float32Array(normals)};
}

// ====================================================
// THREE.JS
// ====================================================
let scene, camera, renderer, orbitalMesh, axesHelper;
let nucleusMesh=null;
let autoRotate=false;
let currentColor={c1:'#6496ff', c2:'#64c8ff'};
let currentN=1, currentL=0, currentM=0;
let viewMode='wireframe'; // 'wireframe' | 'cloud'
let isDragging=false, prevMouse={x:0,y:0};
let cameraTheta=0.5, cameraPhi=1.2, cameraR=6;

let isLightTheme = false;

const darkPalettes = [
    { c1: '#6496ff', c2: '#64c8ff', name: 'Azul Elétrico' },
    { c1: '#00ccff', c2: '#64ffc8', name: 'Cyan Quântico' },
    { c1: '#00ff88', c2: '#ccffee', name: 'Verde Neon' },
    { c1: '#ff9664', c2: '#ffcc88', name: 'Laranja Solar' },
    { c1: '#c864ff', c2: '#e8aaff', name: 'Violeta Plasma' },
    { c1: '#64ffc8', c2: '#ccffe8', name: 'Menta Luminosa' },
    { c1: '#f5c842', c2: '#fde68a', name: 'Dourado' }
];

const lightPalettes = [
    { c1: '#050a14', c2: '#1a2b4c', name: 'Preto Absoluto' },
    { c1: '#0a1931', c2: '#15325b', name: 'Azul Noturno Ultra-Escuro' },
    { c1: '#062912', c2: '#0d4a22', name: 'Verde Floresta Escuro' },
    { c1: '#260438', c2: '#470966', name: 'Púrpura Escura' },
    { c1: '#3b0606', c2: '#690b0b', name: 'Carmim Profundo' },
    { c1: '#002b36', c2: '#004d61', name: 'Azul Marinho Escuro' },
    { c1: '#2b1a08', c2: '#4d2e0e', name: 'Marrom Café Escuro' }
];

function renderColorPalettes() {
    const container = document.getElementById('color-row');
    if (!container) return;
    container.innerHTML = '';
    const palettes = isLightTheme ? lightPalettes : darkPalettes;
    
    // Se a cor atual não existir no novo conjunto, selecionar a primeira
    let found = false;
    palettes.forEach((p, idx) => {
        const div = document.createElement('div');
        const isActive = currentColor.c1 === p.c1;
        if (isActive) found = true;
        div.className = 'color-swatch' + (isActive ? ' active' : '');
        div.style.background = p.c1;
        div.title = p.name;
        div.onclick = (e) => {
            setColor(p.c1, p.c2);
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            div.classList.add('active');
        };
        container.appendChild(div);
    });

    if (!found && palettes.length > 0) {
        currentColor = { c1: palettes[0].c1, c2: palettes[0].c2 };
        if (container.children[0]) container.children[0].classList.add('active');
        triggerRender();
    }
}

function toggleTheme() {
    isLightTheme = !isLightTheme;
    document.body.classList.toggle('theme-light', isLightTheme);
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) {
        btn.textContent = isLightTheme ? '🌙 Tema Escuro' : '☀️ Tema Claro';
    }
    if (renderer) {
        const bgCol = isLightTheme ? 0xf0f4f9 : 0x0a0f25;
        renderer.setClearColor(bgCol, 1);
    }
    renderColorPalettes();
    triggerRender();
}

function initThree(){
    const canvas=document.getElementById('orbital-canvas');
    const wrap=document.getElementById('orbital-canvas-wrap');
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(isLightTheme ? 0xf0f4f9 : 0x0a0f25, 1);
    renderer.setSize(wrap.clientWidth,wrap.clientHeight);

    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(45,wrap.clientWidth/wrap.clientHeight,0.01,1000);
    updateCam();

    // Lights
    scene.add(new THREE.AmbientLight(0x223344,0.9));
    const d1=new THREE.DirectionalLight(0x6496ff,1.1); d1.position.set(5,8,6); scene.add(d1);
    const d2=new THREE.DirectionalLight(0x00ff88,0.6); d2.position.set(-4,-3,-5); scene.add(d2);
    const d3=new THREE.PointLight(0xff5500,1.5,14); d3.position.set(0,0,0); scene.add(d3);

    // Grid sutil
    const grid=new THREE.GridHelper(14,28,0x0a1520,0x070d18);
    grid.position.y=-5; scene.add(grid);

    // Núcleo fixo no centro
    createNucleus();

    // Mouse / touch
    canvas.addEventListener('mousedown',e=>{isDragging=true;prevMouse={x:e.clientX,y:e.clientY};});
    window.addEventListener('mousemove',e=>{
        if(!isDragging) return;
        cameraTheta-=(e.clientX-prevMouse.x)*0.005;
        cameraPhi+=  (e.clientY-prevMouse.y)*0.005;
        cameraPhi=Math.max(0.1,Math.min(Math.PI-0.1,cameraPhi));
        prevMouse={x:e.clientX,y:e.clientY};
        updateCam();
    });
    window.addEventListener('mouseup',()=>isDragging=false);
    canvas.addEventListener('wheel',e=>{
        cameraR+=e.deltaY*0.01;
        cameraR=Math.max(1.5,Math.min(45,cameraR));
        updateCam(); e.preventDefault();
    },{passive:false});

    let lTouch=null;
    canvas.addEventListener('touchstart',e=>{lTouch={x:e.touches[0].clientX,y:e.touches[0].clientY};});
    canvas.addEventListener('touchmove',e=>{
        if(!lTouch) return;
        cameraTheta-=(e.touches[0].clientX-lTouch.x)*0.005;
        cameraPhi+=  (e.touches[0].clientY-lTouch.y)*0.005;
        cameraPhi=Math.max(0.1,Math.min(Math.PI-0.1,cameraPhi));
        lTouch={x:e.touches[0].clientX,y:e.touches[0].clientY};
        updateCam(); e.preventDefault();
    },{passive:false});

    window.addEventListener('resize',()=>{
        const w=wrap.clientWidth,h=wrap.clientHeight;
        camera.aspect=w/h; camera.updateProjectionMatrix();
        renderer.setSize(w,h);
    });

    triggerRender();
    let animTime = 0;
    (function loop(){
        requestAnimationFrame(loop);
        animTime += 0.02;

        if(autoRotate){
            cameraTheta += 0.003;
            updateCam();
        }

        // Animação Quântica Viva: Troca Estocástica Contínua de Pontos + Tremor Quântico
        if(orbitalMesh) {
            if(viewMode === 'cloud' && orbitalMesh.geometry) {
                const geo = orbitalMesh.geometry;
                const posAttr = geo.attributes.position;
                const colAttr = geo.attributes.color;
                const userData = geo.userData;
                
                if (posAttr && userData && userData.poolPositions) {
                    const posArr = posAttr.array;
                    const colArr = colAttr.array;
                    const poolPos = userData.poolPositions;
                    const poolCol = userData.poolColors;
                    const poolCount = userData.poolCount;
                    const activeCount = posAttr.count;
                    
                    // 1. APARIÇÃO E DESAPARECIMENTO ALEATÓRIO: A cada frame, recolocar ~120 pontos aleatórios em novos locais do orbital!
                    const swapCount = Math.floor(activeCount * 0.02); // 2% dos pontos trocam de lugar a cada frame
                    for(let k=0; k<swapCount; k++) {
                        const targetIdx = Math.floor(Math.random() * activeCount);
                        const sourceIdx = Math.floor(Math.random() * poolCount);
                        
                        posArr[targetIdx * 3]     = poolPos[sourceIdx * 3];
                        posArr[targetIdx * 3 + 1] = poolPos[sourceIdx * 3 + 1];
                        posArr[targetIdx * 3 + 2] = poolPos[sourceIdx * 3 + 2];
                        
                        colArr[targetIdx * 3]     = poolCol[sourceIdx * 3];
                        colArr[targetIdx * 3 + 1] = poolCol[sourceIdx * 3 + 1];
                        colArr[targetIdx * 3 + 2] = poolCol[sourceIdx * 3 + 2];
                    }
                    
                    // 2. Micro-tremor aleatório nos pontos para efeito vivo de formigamento
                    for(let i=0; i<activeCount*3; i++) {
                        posArr[i] += (Math.random() - 0.5) * 0.025;
                    }

                    posAttr.needsUpdate = true;
                    if (colAttr) colAttr.needsUpdate = true;
                }
                
                // Rotação sutil da cena
                orbitalMesh.rotation.y = animTime * 0.02;
            } else if(viewMode === 'wireframe') {
                // Pulsação quântica suave e respiração da onda no modo wireframe
                const pulse = 1 + Math.sin(animTime * 1.5) * 0.025;
                orbitalMesh.scale.set(pulse, pulse, pulse);
                orbitalMesh.rotation.y = animTime * 0.08;
            }
        }

        if(nucleusMesh) {
            nucleusMesh.rotation.y += 0.01;
            nucleusMesh.rotation.x += 0.005;
        }

        renderer.render(scene,camera);
    })();
}

function updateCam(){
    if(!camera) return;
    camera.position.set(
        cameraR*Math.sin(cameraPhi)*Math.cos(cameraTheta),
        cameraR*Math.cos(cameraPhi),
        cameraR*Math.sin(cameraPhi)*Math.sin(cameraTheta)
    );
    camera.lookAt(0,0,0);
}

// ★ NÚcleo — esfera laranja simples, igual aos outros modos
function createNucleus(){
    if(nucleusMesh){ scene.remove(nucleusMesh); }

    const nucleusRadius=0.28;
    const geo=new THREE.SphereGeometry(nucleusRadius,32,32);
    const mat=new THREE.MeshPhongMaterial({
        color:0xff4500, emissive:0xff4500,
        emissiveIntensity:0.5, shininess:100
    });
    nucleusMesh=new THREE.Mesh(geo,mat);
    scene.add(nucleusMesh);
}

// ★ ELÉTRON — cópia exata de createElectron() do PROTON.html
// ★ NOVA ABORDAGEM: SphereGeometry deformada pelos harmônicos esféricos reais
// Gera a malha quadriculada (latitude/longitude) idêntica ao PROTON.html
function buildOrbitalGeometry(n, l, m) {
    const segments = 48; // igual PROTON desktop (64 é muito pesado com deformação)
    const baseScale = Math.max(1.8, n * n * 0.28 + 0.9);

    // Geometria base — SphereGeometry cria a malha quadriculada característica
    const geo = new THREE.SphereGeometry(1, segments, segments);
    const pos = geo.attributes.position.array;
    const N = geo.attributes.position.count;

    // Calcular máximo de |Y_l^m|² para normalizar
    let maxY2 = 0;
    for (let i = 0; i < N; i++) {
        const x=pos[i*3], y=pos[i*3+1], z=pos[i*3+2];
        const r=Math.sqrt(x*x+y*y+z*z);
        if(r<1e-10) continue;
        const theta=Math.acos(Math.max(-1,Math.min(1,z/r)));
        const phi=Math.atan2(y,x);
        const Y=sphericalHarmonic(l,m,theta,phi);
        if(Y*Y>maxY2) maxY2=Y*Y;
    }
    if(maxY2<1e-12) maxY2=1;

    // Deformar cada vértice com base em |Y_l^m(θ,φ)|²
    for (let i = 0; i < N; i++) {
        const x=pos[i*3], y=pos[i*3+1], z=pos[i*3+2];
        const r=Math.sqrt(x*x+y*y+z*z);
        if(r<1e-10) continue;
        const theta=Math.acos(Math.max(-1,Math.min(1,z/r)));
        const phi=Math.atan2(y,x);
        const Y=sphericalHarmonic(l,m,theta,phi);
        const Y2norm=Y*Y/maxY2;

        // s orbital (l=0): esfera perfeita como no PROTON
        // outros: deformados pela parte angular
        let newR;
        if(l===0){
            newR = baseScale;
        } else {
            // Raiz quadrada suaviza os lóbulos, evitando colapso nos nódulos
            newR = baseScale * Math.max(0.08, Math.pow(Y2norm, 0.45));
        }

        pos[i*3]   = (x/r)*newR;
        pos[i*3+1] = (y/r)*newR;
        pos[i*3+2] = (z/r)*newR;
    }

    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    return { geo, scale: baseScale };
}

let ctimer=null;
function triggerRender(){
    if(ctimer) clearTimeout(ctimer);
    document.getElementById('loading').style.display='flex';
    ctimer=setTimeout(doRender,60);
}

function toggleViewMode(){
    viewMode = viewMode === 'wireframe' ? 'cloud' : 'wireframe';
    const btn = document.getElementById('btn-viewmode');
    if(btn){
        btn.textContent = viewMode === 'cloud' ? '🔧 Wireframe' : '☁️ Nuvem de pontos';
        btn.style.background = viewMode === 'cloud' ? 'rgba(0,204,255,0.35)' : '';
        btn.style.borderColor = viewMode === 'cloud' ? '#00ccff' : '';
    }
    const qbIcon = document.getElementById('qbViewIcon');
    const qbText = document.getElementById('qbViewText');
    if(qbIcon) qbIcon.textContent = viewMode === 'cloud' ? '🔧' : '☁️';
    if(qbText) qbText.textContent = viewMode === 'cloud' ? 'Wireframe' : 'Nuvem';
    triggerRender();
}

function buildCloudPoints(n, l, m, scale){
    // Rejection sampling com pool amplo de posições quânticas
    const POOL_SIZE = 8000;
    const maxR = scale * 1.85;
    const positions = new Float32Array(POOL_SIZE * 3);
    const colors    = new Float32Array(POOL_SIZE * 3);

    // Calcular psi2 max para normalizar rejection
    let psiMax = 0;
    for(let k=0; k<1500; k++){
        const r = Math.random() * maxR;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos(2 * Math.random() - 1);
        const tx = r * Math.sin(theta) * Math.cos(phi);
        const ty = r * Math.sin(theta) * Math.sin(phi);
        const tz = r * Math.cos(theta);
        const v = psi2(n, l, m, tx, ty, tz);
        if(v > psiMax) psiMax = v;
    }
    if(psiMax < 1e-30) psiMax = 1e-30;

    let accepted = 0;
    let tries = 0;
    const maxTries = POOL_SIZE * 40;
    while(accepted < POOL_SIZE && tries < maxTries){
        tries++;
        const r = Math.pow(Math.random(), 0.333) * maxR;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);

        const prob = psi2(n, l, m, x, y, z) / psiMax;
        if(Math.random() > prob) continue;

        positions[accepted*3]   = x;
        positions[accepted*3+1] = y;
        positions[accepted*3+2] = z;

        const d = Math.sqrt(x*x + y*y + z*z);
        const decayR = Math.max(1, scale * 0.65);
        const f = Math.exp(-d / decayR);

        const c = new THREE.Color(currentColor.c1);
        colors[accepted*3]   = c.r * f + (1-f) * c.r * 0.35;
        colors[accepted*3+1] = c.g * f + (1-f) * c.g * 0.35;
        colors[accepted*3+2] = c.b * f + (1-f) * c.b * 0.35;

        accepted++;
    }

    // Selecionar N_DISPLAY pontos visíveis iniciais
    const N_DISPLAY = Math.min(5000, accepted);
    const activePositions = positions.slice(0, N_DISPLAY * 3);
    const activeColors    = colors.slice(0, N_DISPLAY * 3);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(activePositions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(activeColors, 3));
    
    // Armazenar todo o reservatório (POOL) de posições válidas para recolocação contínua
    geo.userData = {
        poolPositions: positions.slice(0, accepted * 3),
        poolColors: colors.slice(0, accepted * 3),
        poolCount: accepted
    };
    return geo;
}

function doRender(){
    if(!scene) return;
    try {
        if(orbitalMesh){ scene.remove(orbitalMesh); if(orbitalMesh.geometry) orbitalMesh.geometry.dispose(); if(orbitalMesh.material) orbitalMesh.material.dispose(); }

        const n=currentN, l=currentL, m=currentM;
        const scale = Math.max(1.8, n*n*0.28+0.9);

        // Zoom out inicial ajustado para caber perfeitamente na tela sem cortar
        cameraR = (viewMode === 'cloud') ? scale * 4.6 + 6.0 : scale * 2.8 + 1.5;
        updateCam();

        if(viewMode === 'cloud'){
            if (!window._particleTex) {
                const canvas = document.createElement('canvas');
                canvas.width = 64; canvas.height = 64;
                const ctx = canvas.getContext('2d');
                const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
                grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 64, 64);
                window._particleTex = new THREE.CanvasTexture(canvas);
            }
            const geo = buildCloudPoints(n, l, m, scale);
            const mat = new THREE.PointsMaterial({
                size: 0.28,
                map: window._particleTex,
                vertexColors: true,
                transparent: true,
                opacity: isLightTheme ? 0.9 : 0.65,
                blending: isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending,
                depthWrite: false
            });
            orbitalMesh = new THREE.Points(geo, mat);
        } else {
            // Wireframe deformado original
            const { geo } = buildOrbitalGeometry(n, l, m);
            const mat = new THREE.MeshPhongMaterial({
                color: new THREE.Color(currentColor.c1),
                transparent: true,
                opacity: isLightTheme ? 0.75 : 0.3,
                wireframe: true,
                side: THREE.DoubleSide
            });
            orbitalMesh = new THREE.Mesh(geo, mat);
        }

        scene.add(orbitalMesh);
        updatePanel();
    } catch(err) {
        console.error("Erro na renderização:", err);
    } finally {
        const ld = document.getElementById('loading');
        if(ld) ld.style.display = 'none';
    }
}

// ── UI ──
const orbNames=['s','p','d','f','g'];
const descs={
    '100':'Orbital 1s: esférico perfeito. Estado fundamental do hidrogênio. Densidade máxima no núcleo, sem nódos.',
    '200':'Orbital 2s: esférico com 1 nódulo radial. Elétrons mais afastados do que o 1s.',
    '210':'Orbital 2p₀: dois lobos opostos ao longo do eixo z. Nódulo planar em z=0.',
    '211':'Orbital 2p±1: toroide em torno do eixo z. Forma da função de onda real.',
    '300':'Orbital 3s: esférico com 2 nódulos radiais concêntricos.',
    '310':'Orbital 3p₀: lobos axiais com estrutura radial intermediária.',
    '311':'Orbital 3p±1: toroide maior com subestrutura interna.',
    '320':'Orbital 3d₀: dois cones opostos (formato roseta). 4 lóbulos angulares.',
    '321':'Orbital 3d±1: quatro lóbulos com plano nodal.',
    '322':'Orbital 3d±2: toroide compacto no plano equatorial.',
};

function onNChange(v){
    currentN=+v;
    document.getElementById('val-n').textContent=v;
    document.getElementById('disp-n').textContent=v;
    const sl=document.getElementById('sl-l');
    sl.max=v-1; if(+sl.value>v-1) sl.value=v-1;
    onLChange(sl.value);
}

function onLChange(v){
    currentL=+v;
    document.getElementById('val-l').textContent=v;
    document.getElementById('disp-l').textContent=v;
    const sm=document.getElementById('sl-m');
    sm.min=-v; sm.max=+v;
    if(+sm.value>+v) sm.value=+v;
    if(+sm.value<-v) sm.value=-v;
    onMChange(sm.value);
}

function onMChange(v){
    currentM=+v;
    document.getElementById('val-m').textContent=v;
    document.getElementById('disp-m').textContent=v;
    triggerRender();
}

function setColor(c1,c2){
    currentColor={c1,c2};
    document.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('active'));
    event.target.classList.add('active');
    triggerRender();
}

function toggleRotate(){
    autoRotate=!autoRotate;
    const btn = document.getElementById('btn-rot');
    if (btn) btn.classList.toggle('active',autoRotate);
    const qbBtn = document.getElementById('qbRotText');
    if (qbBtn) qbBtn.textContent = autoRotate ? 'Continuar' : 'Pausar';
}

// ══════════════════════════════════════════════
// ACORDEÃO — Toggle de seções recolhíveis (Mobile-First)
// ══════════════════════════════════════════════
window.toggleAccordion = function(groupId) {
    if (window.innerWidth > 900) return; // Em desktop mantem tudo aberto e visivel

    const group = document.getElementById(groupId);
    if (!group) return;

    const header = group.querySelector('.accordion-header');
    const content = group.querySelector('.accordion-content');
    if (!header || !content) return;

    const isOpen = content.classList.contains('open');
    content.classList.toggle('open', !isOpen);
    header.classList.toggle('open', !isOpen);
    header.setAttribute('aria-expanded', String(!isOpen));
};

function resetCamera(){
    cameraTheta=0.5; cameraPhi=1.2;
    // Reajusta raio ao orbital atual
    const scale=Math.max(1.6, currentN*currentN*0.28+0.8);
    cameraR=scale*2.8+1.5;
    updateCam();
}

function toggleAxes(){
    if(axesHelper){scene.remove(axesHelper);axesHelper=null;}
    else{axesHelper=new THREE.AxesHelper(3);scene.add(axesHelper);}
}

function updatePanel(){
    const n=currentN,l=currentL,m=currentM;
    const name=n+orbNames[l]+(m!==0?` (m=${m})`:'');
    document.getElementById('orbital-name').textContent=name;
    document.getElementById('orbital-symbol').textContent=n+orbNames[l];
    const subs=['s — esférico','p — lobos/toroide','d — roseta/toroide','f — complexo','g — muito complexo'];
    document.getElementById('orbital-type').textContent='Orbital '+subs[l];
    const energy=(-13.6/(n*n)).toFixed(3);
    document.getElementById('ov-energy').textContent=energy;
    document.getElementById('ov-formula').textContent=`E = −13.6 / ${n}² eV`;
    document.getElementById('ov-r').textContent=(n*n).toFixed(1);
    document.getElementById('ov-deg').textContent=n*n;
    const L=Math.sqrt(l*(l+1));
    document.getElementById('ov-L').textContent=L.toFixed(3);
    document.getElementById('ov-Lz').textContent=m;
    document.getElementById('info-L').textContent=L.toFixed(3);
    document.getElementById('info-Lz').textContent=m;
    document.getElementById('info-deg2').textContent=n*n;
    document.getElementById('info-nr').textContent=n-l-1;
    document.getElementById('info-na').textContent=l;
    const key=`${n}${l}${Math.abs(m)}`;
    document.getElementById('info-desc').textContent=descs[key]||
        `Orbital ${name}: n=${n}, l=${l}, m=${m}. Nódulos radiais: ${n-l-1}, angulares: ${l}. Total: ${n-1}.`;
}

// Mobile hint
if(/Mobi|Android|iPhone/i.test(navigator.userAgent)){
    document.querySelector('.desktop-hint').style.display='none';
    document.querySelector('.mobile-hint').style.display='inline';
}

window.addEventListener('load',()=>{ initThree(); renderColorPalettes(); updatePanel(); });