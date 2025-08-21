export const idlFactory = ({ IDL }) => {
  const User = IDL.Record({
    'internetId' : IDL.Text,
    'email' : IDL.Text,
    'first_name' : IDL.Text,
    'second_name' : IDL.Text,
  });
  return IDL.Service({
    'deleteUser' : IDL.Func([IDL.Principal], [], []),
    'getUser' : IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
    'registerUser' : IDL.Func([IDL.Principal, User], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
