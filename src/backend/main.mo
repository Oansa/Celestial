import OrderedMap "mo:base/OrderedMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Registry "blob-storage/registry";
import Principal "mo:base/Principal";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Array "mo:base/Array";

persistent actor {
  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);

  public type Coordinates = {
    latitude : Float;
    longitude : Float;
    latitudeDirection : Text;
    longitudeDirection : Text;
    areaName : Text;
  };

  public type Category = {
    #treePlanting;
    #cleanup;
    #renewableEnergy;
    #awarenessEvent;
  };

  public type ClimateAction = {
    id : Text;
    photoPath : Text;
    coordinates : Coordinates;
    temperature : Float;
    weatherNotes : Text;
    description : Text;
    categories : [Category];
    timestamp : Int;
    userDisplayName : Text;
  };

  public type UserProfile = {
    displayName : Text;
    bio : Text;
    profilePhotoPath : ?Text;
  };

  public type ChatMessage = {
    id : Text;
    sender : Text;
    content : Text;
    timestamp : Int;
  };

  public type WeatherQuery = {
    location : Text;
    queryType : Text;
  };

  public type WeatherResponse = {
    location : Text;
    temperature : Float;
    conditions : Text;
    forecast : Text;
  };

  public type LocationFilter = {
    continent : ?Text;
    country : ?Text;
    adminDivision : ?Text;
  };

  public type NotificationPreference = {
    receiveAllUpdates : Bool;
    followedUsers : [Principal];
    areaPreferences : [Text];
  };

  public type Notification = {
    id : Text;
    message : Text;
    timestamp : Int;
    read : Bool;
    relatedActionId : ?Text;
  };

  var climateActions : OrderedMap.Map<Text, ClimateAction> = textMap.empty<ClimateAction>();
  var userProfiles : OrderedMap.Map<Principal, UserProfile> = principalMap.empty<UserProfile>();
  var chatHistory : OrderedMap.Map<Text, ChatMessage> = textMap.empty<ChatMessage>();
  var notificationPreferences : OrderedMap.Map<Principal, NotificationPreference> = principalMap.empty<NotificationPreference>();
  var notifications : OrderedMap.Map<Principal, [Notification]> = principalMap.empty<[Notification]>();
  let registry = Registry.new();
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func registerFileReference(path : Text, hash : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can register file references");
    };
    if (path == "" or hash == "") {
      Debug.trap("Path and hash must not be empty");
    };
    Registry.add(registry, path, hash);
  };

  public query ({ caller }) func getFileReference(path : Text) : async Registry.FileReference {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can get file references");
    };
    Registry.get(registry, path);
  };

  public query ({ caller }) func listFileReferences() : async [Registry.FileReference] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can list file references");
    };
    Registry.list(registry);
  };

  public shared ({ caller }) func dropFileReference(path : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can drop file references");
    };
    if (path == "") {
      Debug.trap("Path must not be empty");
    };
    Registry.remove(registry, path);
  };

  public shared ({ caller }) func uploadClimateAction(
    id : Text,
    photoPath : Text,
    coordinates : Coordinates,
    temperature : Float,
    weatherNotes : Text,
    description : Text,
    categories : [Category],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can upload climate actions");
    };
    if (id == "" or photoPath == "" or weatherNotes == "" or description == "") {
      Debug.trap("Required fields must not be empty");
    };

    let userDisplayName = switch (principalMap.get(userProfiles, caller)) {
      case (?profile) profile.displayName;
      case null "Anonymous";
    };

    let climateAction : ClimateAction = {
      id;
      photoPath;
      coordinates;
      temperature;
      weatherNotes;
      description;
      categories;
      timestamp = Time.now();
      userDisplayName;
    };

    climateActions := textMap.put(climateActions, id, climateAction);

    let notificationMessage = "New climate action by " # userDisplayName # " in " # coordinates.areaName;
    let notification : Notification = {
      id = id # "_notification";
      message = notificationMessage;
      timestamp = Time.now();
      read = false;
      relatedActionId = ?id;
    };

    for ((user, pref) in principalMap.entries(notificationPreferences)) {
      if (pref.receiveAllUpdates) {
        let userNotifications = switch (principalMap.get(notifications, user)) {
          case (?existing) existing;
          case null [];
        };
        let updatedNotifications = Array.append(userNotifications, [notification]);
        notifications := principalMap.put(notifications, user, updatedNotifications);
      };
    };
  };

  public query func getAllClimateActions() : async [ClimateAction] {
    Iter.toArray(textMap.vals(climateActions));
  };

  public query func getClimateAction(id : Text) : async ?ClimateAction {
    textMap.get(climateActions, id);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can save user profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    principalMap.get(userProfiles, caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func sendChatMessage(message : ChatMessage) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can send chat messages");
    };
    if (message.id == "" or message.sender == "" or message.content == "") {
      Debug.trap("Message fields must not be empty");
    };
    chatHistory := textMap.put(chatHistory, message.id, message);
  };

  public query func getChatHistory() : async [ChatMessage] {
    Iter.toArray(textMap.vals(chatHistory));
  };

  public query func getChatMessage(id : Text) : async ?ChatMessage {
    textMap.get(chatHistory, id);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared func fetchWeatherData(url : Text) : async Text {
    await OutCall.httpGetRequest(url, [], transform);
  };

  public query func getFilteredClimateActions(filter : LocationFilter) : async [ClimateAction] {
    let filteredActions = Iter.filter<ClimateAction>(
      textMap.vals(climateActions),
      func(action : ClimateAction) : Bool {
        let matchesContinent = switch (filter.continent) {
          case null true;
          case (?continent) action.weatherNotes == continent;
        };
        let matchesCountry = switch (filter.country) {
          case null true;
          case (?country) action.description == country;
        };
        let matchesAdminDivision = switch (filter.adminDivision) {
          case null true;
          case (?adminDivision) action.weatherNotes == adminDivision;
        };
        matchesContinent and matchesCountry and matchesAdminDivision;
      },
    );
    Iter.toArray(filteredActions);
  };

  public shared ({ caller }) func setNotificationPreferences(preferences : NotificationPreference) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can set notification preferences");
    };
    notificationPreferences := principalMap.put(notificationPreferences, caller, preferences);
  };

  public query ({ caller }) func getNotificationPreferences() : async ?NotificationPreference {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can get notification preferences");
    };
    principalMap.get(notificationPreferences, caller);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can get notifications");
    };
    switch (principalMap.get(notifications, caller)) {
      case (?userNotifications) userNotifications;
      case null [];
    };
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can mark notifications as read");
    };
    switch (principalMap.get(notifications, caller)) {
      case (?userNotifications) {
        let updatedNotifications = Array.map<Notification, Notification>(
          userNotifications,
          func(notification : Notification) : Notification {
            if (notification.id == notificationId) {
              { notification with read = true };
            } else {
              notification;
            };
          },
        );
        notifications := principalMap.put(notifications, caller, updatedNotifications);
      };
      case null Debug.trap("No notifications found for user");
    };
  };

  public shared ({ caller }) func clearNotifications() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can clear notifications");
    };
    notifications := principalMap.put(notifications, caller, []);
  };
};
