import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface User {
  'internetId' : string,
  'email' : string,
  'first_name' : string,
  'second_name' : string,
}
export interface _SERVICE {
  'deleteUser' : ActorMethod<[Principal], undefined>,
  'getUser' : ActorMethod<[Principal], [] | [User]>,
  'registerUser' : ActorMethod<[Principal, User], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
