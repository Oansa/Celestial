import Trie "mo:base/Trie";
import Principal "mo:base/Principal";
import Hash "mo:base/Hash";
import Text "mo:base/Text";


actor UserAuth {

  public type User = {
    first_name : Text;
    second_name : Text;
    email : Text;
    internetId : Text;
  };

  // Hash + Equal for Principal keys
  func keyHash(p : Principal) : Hash.Hash {
    Text.hash(Principal.toText(p));
  };

  func keyEq(p1 : Principal, p2 : Principal) : Bool {
    Principal.equal(p1, p2);
  };

  stable var users : Trie.Trie<Principal, User> = Trie.empty();

  // Register a user
  public func registerUser(principal : Principal, user : User) : async () {
    users := Trie.put(users, { key = principal; hash = keyHash(principal) }, keyEq, user).0;
  };

  // Get a user
  public query func getUser(principal : Principal) : async ?User {
    Trie.get(users, { key = principal; hash = keyHash(principal) }, keyEq);
  };

  // Delete a user
  public func deleteUser(principal : Principal) : async () {
    users := Trie.remove(users, { key = principal; hash = keyHash(principal) }, keyEq).0;
  };

}
