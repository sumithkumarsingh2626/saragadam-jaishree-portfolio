import Text from "../../base/Text";
import SkillsSign from "./SkillsSign";

const skillSections = [
  {
    title: "Languages",
    items: ["Java", "Python", "JavaScript"],
  },
  {
    title: "Frontend",
    items: ["HTML5", "CSS3", "React", "Bootstrap", "Tailwind CSS"],
  },
  {
    title: "Tools",
    items: ["Git", "GitHub", "VS Code"],
  },
  {
    title: "Core Focus",
    items: ["Data Structures & Algorithms with Java"],
  },
  {
    title: "Strengths",
    items: ["Problem Solving", "Time Management", "Leadership", "Quick Learning"],
  },
];

const Skills = () => {
  return (
    <group>
      <Text
        type="3d"
        rotation={[-Math.PI / 2, 2 * Math.PI, 0]}
        position={[-110, 0, 140]}
        textOptions={{
          font: "/fonts/Roboto_Regular.json",
          size: 7,
          height: 1,
        }}
      >
        Skills
      </Text>
      <SkillsSign />
      <group position={[-80, 7, 40]}>
        {skillSections.map((section, sectionIndex) => (
          <group key={section.title} position={[0, 0, sectionIndex * 24]}>
            <Text scale={2.2} position={[0, 0, 0]} rotation={[0, 0, 0]}>
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => (
              <Text
                key={item}
                scale={1.4}
                position={[0, -5 - itemIndex * 4, 0]}
                rotation={[0, 0, 0]}
              >
                {item}
              </Text>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};

export default Skills;
