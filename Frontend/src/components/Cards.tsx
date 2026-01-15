import { LuUsers, LuMousePointer2, LuHistory } from "react-icons/lu";
import React from "react";
import { motion } from "framer-motion";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  Flex
} from "@chakra-ui/react";

interface CardData {
  text: string;
  desc: string;
  icon: any;
  color: string;
}

const data: CardData[] = [
  {
    text: "Real-time Collaboration",
    desc: "Work with your team simultaneously on the same canvas with zero latency.",
    icon: LuUsers,
    color: "blue",
  },
  {
    text: "Multi-user Cursors",
    desc: "See exactly where your teammates are pointing with live high-fidelity cursors.",
    icon: LuMousePointer2,
    color: "purple",
  },
  {
    text: "Smart History",
    desc: "Every stroke is captured. Travel back in time to any version of your board.",
    icon: LuHistory,
    color: "pink",
  },
];

const FeatureCard = ({ icon, text, desc, color, delay }: CardData & { delay: number }) => {
  const cardBg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`${color}.600`, `${color}.200`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <Box
        bg={cardBg}
        p={8}
        borderRadius="3xl"
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
        height="100%"
        transition="all 0.4s"
        _hover={{
          transform: "translateY(-10px)",
          boxShadow: "2xl",
          borderColor: `${color}.400`,
        }}
      >
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          w="100px"
          h="100px"
          bg={`${color}.400`}
          filter="blur(50px)"
          opacity={0.15}
          borderRadius="full"
        />

        <Flex
          w={14}
          h={14}
          bg={iconBg}
          color={iconColor}
          borderRadius="2xl"
          align="center"
          justify="center"
          mb={6}
          fontSize="2xl"
          boxShadow="inner"
        >
          <Icon as={icon} />
        </Flex>

        <Heading size="md" mb={4} fontWeight="800" color={useColorModeValue("gray.900", "white")}>
          {text}
        </Heading>
        <Text color={useColorModeValue("gray.500", "gray.400")} lineHeight="relaxed">
          {desc}
        </Text>
      </Box>
    </motion.div>
  );
};

const Cards: React.FC = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} maxW="container.xl" mx="auto">
      {data.map((item, index) => (
        <FeatureCard
          key={index}
          {...item}
          delay={index * 0.1}
        />
      ))}
    </SimpleGrid>
  );
};

export default Cards;
