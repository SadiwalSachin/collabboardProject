import React from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { register } from '../hooks/useAuth';

const Signup: React.FC = () => {
  const handleSignup = () => {
    register();
  };

  return (
    <Container centerContent maxW="md" py={12}>
      <VStack spacing={8} w="full">
        <Heading as="h1" size="xl" textAlign="center">
          Create Account
        </Heading>
        <Box w="full" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
          <VStack spacing={4}>
            <FormControl id="name">
              <FormLabel>Full Name</FormLabel>
              <Input type="text" placeholder="Enter your full name" />
            </FormControl>
            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <Input type="email" placeholder="Enter your email" />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" placeholder="Enter your password" />
            </FormControl>
            <FormControl id="confirmPassword">
              <FormLabel>Confirm Password</FormLabel>
              <Input type="password" placeholder="Confirm your password" />
            </FormControl>
            <Button colorScheme="green" size="lg" w="full" onClick={handleSignup}>
              Sign Up
            </Button>
          </VStack>
        </Box>
        <Text>
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="blue.500">
            Login
          </Link>
        </Text>
      </VStack>
    </Container>
  );
};

export default Signup;