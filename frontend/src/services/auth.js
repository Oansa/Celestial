import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../declarations/UserAuth';

let authActor = null;

export const createAuthActor = () => {
  if (authActor) return authActor;
  
  const isDev = import.meta.env.DEV;
  const agent = new HttpAgent({
    host: isDev ? 'http://localhost:4943' : 'https://ic0.app'
  });
  
  // Fetch root key for certificate validation during development
  if (isDev) {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }
  
  authActor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
  
  return authActor;
};

export const signup = async (firstName, secondName, email, internetId) => {
  const actor = createAuthActor();
  return await actor.signup(firstName, secondName, email, internetId);
};

export const getUser = async (principal) => {
  const actor = createAuthActor();
  return await actor.getUser(principal);
};
