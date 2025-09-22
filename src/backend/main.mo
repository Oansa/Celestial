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
import Nat "mo:base/Nat";
import Stripe "stripe/stripe";
import Int "mo:base/Int";

actor {
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

  public type TreePlantingData = {
    numberOfTrees : Nat;
    treeSpecies : Text;
    areaSize : Float;
    areaUnit : Text;
  };

  public type CleanupData = {
    wasteType : Text;
    amount : Float;
    amountUnit : Text;
    areaCleaned : Text;
  };

  public type RenewableEnergyData = {
    installationType : Text;
    energyCapacity : Float;
    capacityUnit : Text;
    installationDetails : Text;
  };

  public type CategoryData = {
    #treePlanting : TreePlantingData;
    #cleanup : CleanupData;
    #renewableEnergy : RenewableEnergyData;
    #awarenessEvent;
  };

  public type ClimateAction = {
    id : Text;
    photoPath : Text;
    coordinates : Coordinates;
    temperature : Float;
    weatherNotes : Text;
    description : Text;
    category : Category;
    categoryData : CategoryData;
    timestamp : Int;
    userDisplayName : Text;
    walletAddress : ?Text;
  };

  public type UserProfile = {
    displayName : Text;
    bio : Text;
    profilePhotoPath : ?Text;
    isPremium : Bool;
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

  public type ActiveUser = {
    principal : Principal;
    displayName : Text;
    profilePhotoPath : ?Text;
    bio : Text;
    lastActive : Int;
    isPremium : Bool;
  };

  public type VoteType = {
    #upvote;
    #downvote;
  };

  public type WeatherReportVote = {
    reportId : Text;
    user : Principal;
    voteType : VoteType;
    timestamp : Int;
  };

  public type WeatherReportVotes = {
    upvotes : Nat;
    downvotes : Nat;
    userVotes : [WeatherReportVote];
  };

  public type DonationMethod = {
    #stripe;
    #crypto;
  };

  public type CryptoWallet = {
    currency : Text;
    address : Text;
    qrCodeUrl : Text;
  };

  public type Donation = {
    id : Text;
    amount : Float;
    currency : Text;
    method : DonationMethod;
    timestamp : Int;
    submissionId : Text;
    donor : ?Principal;
    transactionId : Text;
  };

  public type DonationConfig = {
    stripeApiKey : Text;
    cryptoWallets : [CryptoWallet];
  };

  public type Comment = {
    id : Text;
    submissionId : Text;
    author : Text;
    content : Text;
    timestamp : Int;
  };

  var climateActions : OrderedMap.Map<Text, ClimateAction> = textMap.empty<ClimateAction>();
  var userProfiles : OrderedMap.Map<Principal, UserProfile> = principalMap.empty<UserProfile>();
  var chatHistory : OrderedMap.Map<Text, ChatMessage> = textMap.empty<ChatMessage>();
  var notificationPreferences : OrderedMap.Map<Principal, NotificationPreference> = principalMap.empty<NotificationPreference>();
  var notifications : OrderedMap.Map<Principal, [Notification]> = principalMap.empty<[Notification]>();
  var activeUsers : OrderedMap.Map<Principal, ActiveUser> = principalMap.empty<ActiveUser>();
  var weatherReportVotes : OrderedMap.Map<Text, WeatherReportVotes> = textMap.empty<WeatherReportVotes>();
  var donations : OrderedMap.Map<Text, Donation> = textMap.empty<Donation>();
  var donationConfig : ?DonationConfig = null;
  var stripeConfig : ?Stripe.StripeConfiguration = null;
  var comments : OrderedMap.Map<Text, Comment> = textMap.empty<Comment>();
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
    category : Category,
    categoryData : CategoryData,
    walletAddress : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can upload climate actions");
    };
    if (id == "" or photoPath == "" or weatherNotes == "" or description == "") {
      Debug.trap("Required fields must not be empty");
    };

    let userProfile = principalMap.get(userProfiles, caller);
    let userDisplayName = switch (userProfile) {
      case (?profile) profile.displayName;
      case null "Anonymous";
    };

    let isPremium = switch (userProfile) {
      case (?profile) profile.isPremium;
      case null false;
    };

    if (walletAddress != null and not isPremium) {
      Debug.trap("Only premium users can request funding with a wallet address");
    };

    let climateAction : ClimateAction = {
      id;
      photoPath;
      coordinates;
      temperature;
      weatherNotes;
      description;
      category;
      categoryData;
      timestamp = Time.now();
      userDisplayName;
      walletAddress;
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

  public shared ({ caller }) func updateActiveUser() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can update active status");
    };

    let userProfile = principalMap.get(userProfiles, caller);
    let profile = switch (userProfile) {
      case null {
        {
          displayName = "Anonymous";
          bio = "";
          profilePhotoPath = null;
          isPremium = false;
        };
      };
      case (?p) p;
    };

    let activeUser : ActiveUser = {
      principal = caller;
      displayName = profile.displayName;
      profilePhotoPath = profile.profilePhotoPath;
      bio = profile.bio;
      lastActive = Time.now();
      isPremium = profile.isPremium;
    };

    activeUsers := principalMap.put(activeUsers, caller, activeUser);
  };

  public query ({ caller }) func getActiveUsers() : async [ActiveUser] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can get active users");
    };
    Iter.toArray(principalMap.vals(activeUsers));
  };

  public shared ({ caller }) func voteWeatherReport(reportId : Text, voteType : VoteType) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can vote on weather reports");
    };

    let currentVotes = switch (textMap.get(weatherReportVotes, reportId)) {
      case (?votes) votes;
      case null {
        let emptyVotes : WeatherReportVotes = {
          upvotes = 0;
          downvotes = 0;
          userVotes = [];
        };
        emptyVotes;
      };
    };

    let existingVote = Array.find<WeatherReportVote>(
      currentVotes.userVotes,
      func(vote : WeatherReportVote) : Bool {
        vote.user == caller;
      },
    );

    switch (existingVote) {
      case (?vote) {
        if (vote.voteType == voteType) {
          Debug.trap("User has already voted with the same vote type");
        } else {
          let updatedUserVotes = Array.map<WeatherReportVote, WeatherReportVote>(
            currentVotes.userVotes,
            func(v : WeatherReportVote) : WeatherReportVote {
              if (v.user == caller) {
                { v with voteType };
              } else {
                v;
              };
            },
          );

          let (newUpvotes, newDownvotes) = switch (voteType) {
            case (#upvote) (currentVotes.upvotes + 1, if (currentVotes.downvotes > 0) { currentVotes.downvotes - 1 : Nat } else { 0 });
            case (#downvote) (if (currentVotes.upvotes > 0) { currentVotes.upvotes - 1 : Nat } else { 0 }, currentVotes.downvotes + 1);
          };

          let updatedVotes : WeatherReportVotes = {
            currentVotes with
            upvotes = newUpvotes;
            downvotes = newDownvotes;
            userVotes = updatedUserVotes;
          };

          weatherReportVotes := textMap.put(weatherReportVotes, reportId, updatedVotes);
        };
      };
      case null {
        let newVote : WeatherReportVote = {
          reportId;
          user = caller;
          voteType;
          timestamp = Time.now();
        };

        let updatedUserVotes = Array.append(currentVotes.userVotes, [newVote]);
        let (newUpvotes, newDownvotes) = switch (voteType) {
          case (#upvote) (currentVotes.upvotes + 1, currentVotes.downvotes);
          case (#downvote) (currentVotes.upvotes, currentVotes.downvotes + 1);
        };

        let updatedVotes : WeatherReportVotes = {
          currentVotes with
          upvotes = newUpvotes;
          downvotes = newDownvotes;
          userVotes = updatedUserVotes;
        };

        weatherReportVotes := textMap.put(weatherReportVotes, reportId, updatedVotes);
      };
    };
  };

  public query func getWeatherReportVotes(reportId : Text) : async WeatherReportVotes {
    switch (textMap.get(weatherReportVotes, reportId)) {
      case (?votes) votes;
      case null {
        {
          upvotes = 0;
          downvotes = 0;
          userVotes = [];
        };
      };
    };
  };

  public query ({ caller }) func getUserVoteStatus(reportId : Text) : async ?VoteType {
    switch (textMap.get(weatherReportVotes, reportId)) {
      case (?votes) {
        let userVote = Array.find<WeatherReportVote>(
          votes.userVotes,
          func(vote : WeatherReportVote) : Bool {
            vote.user == caller;
          },
        );
        switch (userVote) {
          case (?vote) ?vote.voteType;
          case null null;
        };
      };
      case null null;
    };
  };

  public shared ({ caller }) func makeDonation(
    amount : Float,
    currency : Text,
    method : DonationMethod,
    submissionId : Text,
    transactionId : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can make donations");
    };
    if (amount <= 0 or currency == "" or submissionId == "" or transactionId == "") {
      Debug.trap("Invalid donation parameters");
    };

    let donation : Donation = {
      id = transactionId;
      amount;
      currency;
      method;
      timestamp = Time.now();
      submissionId;
      donor = ?caller;
      transactionId;
    };

    donations := textMap.put(donations, transactionId, donation);
  };

  public query func getDonationsBySubmission(submissionId : Text) : async [Donation] {
    let filteredDonations = Iter.filter<Donation>(
      textMap.vals(donations),
      func(donation : Donation) : Bool {
        donation.submissionId == submissionId;
      },
    );
    Iter.toArray(filteredDonations);
  };

  public query func getAllDonations() : async [Donation] {
    Iter.toArray(textMap.vals(donations));
  };

  public shared ({ caller }) func setDonationConfig(config : DonationConfig) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Debug.trap("Unauthorized: Only admins can set donation config");
    };
    donationConfig := ?config;
  };

  public query func getDonationConfig() : async ?DonationConfig {
    donationConfig;
  };

  public query func getCryptoWallets() : async [CryptoWallet] {
    switch (donationConfig) {
      case (?config) config.cryptoWallets;
      case null [];
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Debug.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case null Debug.trap("Stripe needs to be first configured");
      case (?value) value;
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func addComment(submissionId : Text, content : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.trap("Unauthorized: Only users can add comments");
    };
    if (content == "") {
      Debug.trap("Comment content must not be empty");
    };

    let author = switch (principalMap.get(userProfiles, caller)) {
      case (?profile) profile.displayName;
      case null "Anonymous";
    };

    let comment : Comment = {
      id = submissionId # "_" # Nat.toText(Int.abs(Time.now()));
      submissionId;
      author;
      content;
      timestamp = Time.now();
    };

    comments := textMap.put(comments, comment.id, comment);
  };

  public query func getCommentsBySubmission(submissionId : Text) : async [Comment] {
    let filteredComments = Iter.filter<Comment>(
      textMap.vals(comments),
      func(comment : Comment) : Bool {
        comment.submissionId == submissionId;
      },
    );
    Iter.toArray(filteredComments);
  };

  public query func getAllComments() : async [Comment] {
    Iter.toArray(textMap.vals(comments));
  };

  public shared ({ caller }) func setUserPremiumStatus(user : Principal, isPremium : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Debug.trap("Unauthorized: Only admins can set user premium status");
    };

    switch (principalMap.get(userProfiles, user)) {
      case (?profile) {
        let updatedProfile = { profile with isPremium };
        userProfiles := principalMap.put(userProfiles, user, updatedProfile);
      };
      case null Debug.trap("User profile not found");
    };
  };

  public query ({ caller }) func getCallerPremiumStatus() : async Bool {
    switch (principalMap.get(userProfiles, caller)) {
      case (?profile) profile.isPremium;
      case null false;
    };
  };

  public shared ({ caller }) func toggleUserPremiumStatus(user : Principal) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Debug.trap("Unauthorized: Only admins can toggle user premium status");
    };

    switch (principalMap.get(userProfiles, user)) {
      case (?profile) {
        let newStatus = not profile.isPremium;
        let updatedProfile = { profile with isPremium = newStatus };
        userProfiles := principalMap.put(userProfiles, user, updatedProfile);
        newStatus;
      };
      case null Debug.trap("User profile not found");
    };
  };

  // New function to search platform data for chatbot integration
  public query func searchPlatformData(searchTerm : Text) : async [Text] {
    let results = Array.map<ClimateAction, Text>(
      Iter.toArray(textMap.vals(climateActions)),
      func(action : ClimateAction) : Text {
        "Location: " # action.coordinates.areaName # ", Category: " # (switch (action.category) {
          case (#treePlanting) "Tree Planting";
          case (#cleanup) "Cleanup";
          case (#renewableEnergy) "Renewable Energy";
          case (#awarenessEvent) "Awareness Event";
        }) # ", User: " # action.userDisplayName;
      },
    );
    results;
  };
};

