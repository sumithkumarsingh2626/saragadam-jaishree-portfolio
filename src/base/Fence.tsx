import { CuboidCollider, RigidBody } from "@react-three/rapier";

interface FenceProps {
  position: [number, number, number];
  length: number;
  rotation?: [number, number, number];
  gaps?: { start: number; end: number }[]; // local Z coordinates from -length/2 to length/2
}

const Fence = ({ position, length, rotation = [0, 0, 0], gaps = [] }: FenceProps) => {
  const POST_SPACING = 8;
  const numPosts = Math.ceil(length / POST_SPACING) + 1;
  
  // Calculate posts, omitting those that fall within any gap
  const posts = Array.from({ length: numPosts }).map((_, i) => {
    const zOffset = (i * POST_SPACING) - (length / 2);
    const inGap = gaps.some(gap => zOffset >= gap.start && zOffset <= gap.end);
    if (inGap) return null;
    
    return (
      <mesh key={`post-${i}`} position={[0, 0.9, zOffset]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.8, 8]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
    );
  });

  // Calculate rail segments
  // Start with one segment for the whole length
  let segments = [{ start: -length / 2, end: length / 2 }];
  
  gaps.forEach(gap => {
    const newSegments: typeof segments = [];
    segments.forEach(seg => {
      // If gap completely covers segment, remove it
      if (gap.start <= seg.start && gap.end >= seg.end) {
        return;
      }
      // If gap is completely inside segment, split it
      if (gap.start > seg.start && gap.end < seg.end) {
        newSegments.push({ start: seg.start, end: gap.start });
        newSegments.push({ start: gap.end, end: seg.end });
        return;
      }
      // If gap overlaps start of segment
      if (gap.start <= seg.start && gap.end > seg.start) {
        newSegments.push({ start: gap.end, end: seg.end });
        return;
      }
      // If gap overlaps end of segment
      if (gap.start < seg.end && gap.end >= seg.end) {
        newSegments.push({ start: seg.start, end: gap.start });
        return;
      }
      // No overlap
      newSegments.push(seg);
    });
    segments = newSegments;
  });

  const rails = segments.map((seg, i) => {
    const segLength = seg.end - seg.start;
    const segCenter = (seg.start + seg.end) / 2;
    return (
      <group key={`rail-${i}`}>
        {/* Top Rail */}
        <mesh position={[0, 1.5, segCenter]} castShadow>
          <boxGeometry args={[0.15, 0.15, segLength]} />
          <meshStandardMaterial color="#6a4b3a" roughness={0.9} />
        </mesh>
        {/* Bottom Rail */}
        <mesh position={[0, 0.6, segCenter]} castShadow>
          <boxGeometry args={[0.15, 0.15, segLength]} />
          <meshStandardMaterial color="#6a4b3a" roughness={0.9} />
        </mesh>
      </group>
    );
  });

  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        {posts}
        {rails}
      </group>
      {/* Create colliders only for the solid rail segments */}
      {segments.map((seg, i) => {
        const segLength = seg.end - seg.start;
        const segCenter = (seg.start + seg.end) / 2;
        return (
          <CuboidCollider 
             key={`collider-${i}`} 
             args={[0.25, 1.0, segLength / 2]}
             position={[0, 1.0, segCenter]} 
          />
        );
      })}
    </RigidBody>
  );
};

export default Fence;
