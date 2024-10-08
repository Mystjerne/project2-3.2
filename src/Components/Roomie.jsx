import { useState, useEffect } from "react";
import { database } from "../firebase";
import { set, ref, update } from "firebase/database";
import { Link } from "react-router-dom";
import UserProfile from "./UserProfile";
import RoomieDetails from "./RoomieDetails";
import { Modal, Button } from "react-bootstrap";

function Roomie({ user, profiles, currentProfile, roomieProfiles }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedProfiles, setDisplayedProfiles] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showLikeModal, setShowLikeModal] = useState(false);

  const DB_PROFILES_KEY = "profiles";
  const profilesRef = ref(database, DB_PROFILES_KEY);

  const handleSwipe = (direction) => {
    if (direction === "right") {
      setCurrentIndex(
        currentIndex < roomieProfiles.length - 1 ? currentIndex + 1 : 0
      );
    } else {
      setCurrentIndex(
        currentIndex > 0 ? currentIndex - 1 : roomieProfiles.length - 1
      );
    }
  };

  const handleLike = () => {
    let displayedProfile = roomieProfiles[currentIndex];
    let userProfile = profiles.find((profile) => profile.key == user.uid);
    userProfile.val.peopleLiked.push(displayedProfile.key);

    const updates = {};
    updates[userProfile.key] = {
      name: userProfile.val.name,
      age: userProfile.val.age,
      occupation: userProfile.val.occupation,
      hobbies: userProfile.val.hobbies,
      smokingPreference: userProfile.val.smokingPreference,
      petFriendly: userProfile.val.petFriendly,
      peopleLiked: userProfile.val.peopleLiked,
      peopleMatched: userProfile.val.peopleMatched,
      url: userProfile.val.url,
    };
    update(profilesRef, updates);
    setShowLikeModal(true);
  };

  const handleClose = () => {
    setShowLikeModal(false);
  };

  useEffect(() => {
    // let profilesForDisplay = profiles.filter(
    //   (profile) => profile.key !== currentProfile.val.peopleMatched
    // );
    // setDisplayedProfiles(profilesForDisplay);
  }, [profiles]);

  //Check matching profiles - can change to App.jsx?
  useEffect(() => {
    if (Object.keys(currentProfile).length !== 0) {
      let myProfileLikes = Object.values(currentProfile.val.peopleLiked);

      profiles.map((profile) => {
        let likedUsersKeys = [];
        if (Object.keys(user).length !== 0) {
          profile.key !== user.uid
            ? (likedUsersKeys = Object.values(profile.val.peopleLiked))
            : null;
        }

        likedUsersKeys.map((likedKey) => {
          if (myProfileLikes.includes(profile.key) && likedKey == user.uid) {
            console.log("Match Found!");
            console.log(profile.val.name);
            console.log("Because " + profile.val.name + " liked: " + likedKey);
            console.log("And you are: " + user.uid);

            if (!currentProfile.val.peopleMatched.includes(profile.key)) {
              currentProfile.val.peopleMatched.push(profile.key);
              const updates = {};
              updates[currentProfile.key] = {
                name: currentProfile.val.name,
                age: currentProfile.val.age,
                occupation: currentProfile.val.occupation,
                hobbies: currentProfile.val.hobbies,
                smokingPreference: currentProfile.val.smokingPreference,
                petFriendly: currentProfile.val.petFriendly,
                peopleLiked: currentProfile.val.peopleLiked,
                peopleMatched: currentProfile.val.peopleMatched,
                url: currentProfile.val.url,
              };
              update(profilesRef, updates);
              createConversation(currentProfile.key, profile.key);
            }
          }
        });
      });
    }
  }, [profiles]);

  const createConversation = (key1, key2) => {
    const conversationId = [key1, key2].sort().join("-");
    set(ref(database, "conversations/" + conversationId), {
      messageId0: {
        sender: "No Name",
        text: "text",
        timestamp: new Date(),
      },
    })
      .then(() => {
        console.log("Conversation ID: " + conversationId);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="text-4xl font-bold my-4 text-white">Roomies Nearby</div>
      {showDetails == true ? (
        <>
          <RoomieDetails profile={roomieProfiles[currentIndex]} />
          <br />
          <button
            className="text-white bg-amber-500 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:focus:ring-yellow-900"
            onClick={() => setShowDetails(false)}
          >
            Back
          </button>
        </>
      ) : null}

      {roomieProfiles.length > 0 && showDetails == false ? (
        <div className="roomie-wrapper">
          <div className="profile-wrapper">
            <div onClick={() => setShowDetails(true)}>
              <UserProfile profile={roomieProfiles[currentIndex]} />
            </div>
            <div className="flex justify-between flex space-x-8">
              {/* resize buttons */}
              <div>
                <button onClick={() => handleSwipe("left")}>
                  <img src="icons/left.png" />
                </button>
              </div>
              <div>
                <button onClick={handleLike}>
                  <img src="icons/like.png" />
                </button>
              </div>
              <div>
                <button onClick={() => handleSwipe("right")}>
                  <img src="icons/right.png" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Modal show={showLikeModal} onHide={handleClose}>
        <Modal.Header style={{ backgroundColor: "#333", color: "white" }}>
          <Modal.Title>Like!</Modal.Title>
        </Modal.Header>
        <Button
          onClick={handleClose}
          style={{ backgroundColor: "white", color: "black" }}
        >
          Close
        </Button>
      </Modal>
    </div>
  );
}

export default Roomie;
