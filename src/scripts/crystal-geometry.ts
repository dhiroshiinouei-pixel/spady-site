/** A closed, 89-facet brilliant cut. Dimensions: 2 × 1.45 × 2. */
export function createBrilliantGeometry(THREE: any): any {
  type Point = [number, number, number];
  const sides = 8;
  const step = (Math.PI * 2) / sides;
  const vertices: Point[] = [];
  const faces: number[][] = [];
  const add = (point: Point) => vertices.push(point) - 1;
  const polar = (radius: number, height: number, angle: number): Point => [
    radius * Math.cos(angle), height, radius * Math.sin(angle),
  ];
  const cross = (a: Point, b: Point): Point => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const subtract = (a: Point, b: Point): Point => [
    a[0] - b[0], a[1] - b[1], a[2] - b[2],
  ];
  const normal = (a: Point, b: Point, c: Point) => cross(subtract(b, a), subtract(c, a));

  // Kite corners are intersections of adjacent bezel / pavilion planes.
  // This keeps every four-sided facet planar, including its hidden diagonal.
  const crownTop = 0.46;
  const girdleTop = 0.04;
  const girdleBottom = -0.04;
  const tipHeight = -0.99;
  const tableRadius = 0.51;
  const starRadius = 0.77;
  const pavilionRadius = 0.61;
  const crownSlope = (crownTop - girdleTop) / (1 - tableRadius);
  const starHeight = girdleTop + crownSlope * (1 - starRadius * Math.cos(step / 2));
  const pavilionHeight = tipHeight + (girdleBottom - tipHeight) * pavilionRadius * Math.cos(step / 2);
  const table = Array.from({ length: sides }, (_, i) => add(polar(tableRadius, crownTop, i * step)));
  const stars = Array.from({ length: sides }, (_, i) => add(polar(starRadius, starHeight, (i + 0.5) * step)));
  const pavilion = Array.from({ length: sides }, (_, i) => add(polar(pavilionRadius, pavilionHeight, (i + 0.5) * step)));
  const tip = add([0, tipHeight, 0]);

  const planeHeight = (point: Point, a: Point, b: Point, c: Point) => {
    const n = normal(a, b, c);
    return a[1] - (n[0] * (point[0] - a[0]) + n[2] * (point[2] - a[2])) / n[1];
  };

  // The 32-sided girdle has gently scalloped upper / lower boundaries.
  // Its intermediate vertices stay on the neighbouring cut planes, so the
  // stone is closed without introducing extra seams across the main facets.
  const top: number[] = [];
  const bottom: number[] = [];
  for (let i = 0; i < sides * 4; i++) {
    const angle = i * step / 4;
    const upper = polar(1, girdleTop, angle);
    const lower = polar(1, girdleBottom, angle);
    if (i % 2) {
      const precedingAngle = (i - 1) * step / 4;
      const followingAngle = (i + 1) * step / 4;
      const sector = Math.floor(i / 4);
      upper[1] = planeHeight(upper,
        polar(1, girdleTop, precedingAngle),
        polar(1, girdleTop, followingAngle), vertices[stars[sector]]);
      lower[1] = planeHeight(lower,
        polar(1, girdleBottom, precedingAngle),
        polar(1, girdleBottom, followingAngle), vertices[pavilion[sector]]);
    }
    top.push(add(upper));
    bottom.push(add(lower));
  }

  faces.push(table);
  for (let i = 0; i < sides; i++) {
    const previous = (i + sides - 1) % sides;
    const next = (i + 1) % sides;
    const a = i * 4;
    const b = (a + 4) % top.length;
    faces.push(
      [top[a], stars[i], table[i], stars[previous]],
      [table[i], stars[i], table[next]],
      [top[a], top[a + 1], top[a + 2], stars[i]],
      [top[a + 2], top[a + 3], top[b], stars[i]],
      [tip, pavilion[previous], bottom[a], pavilion[i]],
      [bottom[a], bottom[a + 1], bottom[a + 2], pavilion[i]],
      [bottom[a + 2], bottom[a + 3], bottom[b], pavilion[i]],
    );
  }
  for (let i = 0; i < top.length; i++) {
    const next = (i + 1) % top.length;
    faces.push([top[i], bottom[i], bottom[next], top[next]]);
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const interior: Point = [0, -0.15, 0];
  for (const sourceFace of faces) {
    const face = [...sourceFace];
    let n = normal(vertices[face[0]], vertices[face[1]], vertices[face[2]]);
    const outward = subtract(vertices[face[0]], interior);
    if (n[0] * outward[0] + n[1] * outward[1] + n[2] * outward[2] < 0) {
      face.reverse();
      n = normal(vertices[face[0]], vertices[face[1]], vertices[face[2]]);
    }
    const length = Math.hypot(...n);
    n = [n[0] / length, n[1] / length, n[2] / length];
    for (let j = 1; j < face.length - 1; j++) {
      for (const vertex of [face[0], face[j], face[j + 1]]) {
        positions.push(...vertices[vertex]);
        normals.push(...n);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.userData.facetCount = faces.length;
  geometry.userData.cut = 'brilliant';
  return geometry;
}
