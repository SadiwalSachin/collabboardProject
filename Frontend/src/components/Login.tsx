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
import { login } from '../hooks/useAuth';

const Login: React.FC = () => {
  const handleLogin = () => {
    login();
  };

  return (
    <Container centerContent maxW="md" py={12}>
      <VStack spacing={8} w="full">
        <Heading as="h1" size="xl" textAlign="center">
          Welcome Back
        </Heading>
        <Box w="full" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
          <VStack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <Input type="email" placeholder="Enter your email" />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" placeholder="Enter your password" />
            </FormControl>
            <Button colorScheme="blue" size="lg" w="full" onClick={handleLogin}>
              Login
            </Button>
          </VStack>
        </Box>
        <Text>
          Don't have an account?{' '}
          <Link as={RouterLink} to="/signup" color="blue.500">
            Sign up
          </Link>
        </Text>
      </VStack>
    </Container>
  );
};

export default Login;