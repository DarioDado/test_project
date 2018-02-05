let express = require("express"),
    router  = express.Router(),
    async = require("async"),
    mongoose = require("mongoose"),
    User = require("../../models/user");


function mapUser(user){
    return {
        id: user._id,
        firstName: user.firstName,
        surname: user.surname,
        age: user.age,
        gender: user.gender
    }
}

function mapUsers(users){
    return users.map(function(value) {
        return mapUser(value);
    })
}

//route for populating user table
router.post("/user/seed", function(req,res,next) {
    let users = req.body.users,
        newUsers = [];

    for (let x = 0, y = users.length; x<y; x+=1) {
        let user = new User({
            _id: users[x].id,
            firstName: users[x].firstName,
            surname: users[x].surname,
            age: users[x].age,
            gender: users[x].gender,
            friends: users[x].friends
        });
        user.save(function(err, user) {
            if (err){
                next(err);
            } else {
                newUsers.push(user);
                if (newUsers.length === y) {
                    res.status(200).json({
                        status: "ok",
                        message: "You have successfully inserted " + newUsers.length + " objects in the user database",
                        newUsers: newUsers
                    });
                }
            }
        });
    }
});

//route which returns direct friends, friends of friends and suggested friends
router.get("/user/:userId", function(req,res,next) {
    let userId = Number(req.params.userId),
        directFriends = [],
        friendsOfFriends = [],
        friendsOfFriendsIds = [],
        suggestedFriends = [],
        suggestedFriendsIds = [];

    User.findById(userId, function(err,user) {
        if (err) {
            next(err);
        } else {
            if (!user) {
                res.status(409).json({
                    status: "ok",
                    message: "There is no user with this id ib database."
                });
            } else {
                if (user.friends.length > 0) {
                    for (let x= 0; x<user.friends.length; x+=1) {
                        User.findById(user.friends[x], function(err,foundedUser) {
                            directFriends.push(foundedUser);
                            if (directFriends.length === user.friends.length) {
                                directFriends.forEach(function(value) {
                                    friendsOfFriendsIds = friendsOfFriendsIds.concat(value.friends);
                                });
                                suggestedFriendsIds = friendsOfFriendsIds;
                                friendsOfFriendsIds = friendsOfFriendsIds.filter(function(value, pos) {
                                    return friendsOfFriendsIds.indexOf(value) == pos;
                                });
                                friendsOfFriendsIds = friendsOfFriendsIds.filter(function(value) {
                                    let notDirectFriends = user.friends.every(function(value1) {
                                        return value !== value1;
                                    });
                                    return notDirectFriends && value !== user._id;
                                });
                                suggestedFriendsIds = suggestedFriendsIds.filter(function(value) {
                                    let notDirectFriends = user.friends.every(function(value1) {
                                        return value !== value1;
                                    });
                                    return notDirectFriends && value !== user._id;
                                });
                                suggestedFriendsIds = suggestedFriendsIds.filter(function(value) {
                                    let count = 0;
                                    for (let x = 0; x<suggestedFriendsIds.length; x+=1) {
                                        if (value === suggestedFriendsIds[x]) {
                                            count += 1;
                                        }
                                    }
                                    return count >= 2;
                                });
                                suggestedFriendsIds = suggestedFriendsIds.filter(function(value, pos) {
                                    return suggestedFriendsIds.indexOf(value) == pos;
                                });

                                if (friendsOfFriendsIds.length > 0) {
                                    for (let x = 0; x<friendsOfFriendsIds.length; x+=1) {
                                        User.findById(friendsOfFriendsIds[x], function(err, fOFUser) {
                                            friendsOfFriends.push(fOFUser);
                                            if (friendsOfFriends.length === friendsOfFriendsIds.length) {
                                                if(suggestedFriendsIds.length > 0) {
                                                    for(let x = 0; x<suggestedFriendsIds.length; x+=1) {
                                                        User.findById(suggestedFriendsIds[x], function(err, sFUser) {
                                                            suggestedFriends.push(sFUser);
                                                            if(suggestedFriends.length === suggestedFriendsIds.length) {
                                                                user = mapUser(user);
                                                                directFriends = directFriends ? mapUsers(directFriends) : 0;
                                                                friendsOfFriends = friendsOfFriends ? mapUsers(friendsOfFriends) : 0;
                                                                suggestedFriends = suggestedFriends ? mapUsers(suggestedFriends) : 0;
                                                                res.status(200).json({
                                                                    status: "ok",
                                                                    user: user,
                                                                    directFriends: directFriends,
                                                                    friendsOfFriends: friendsOfFriends,
                                                                    suggestedFriends: suggestedFriends
                                                                });
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    user = mapUser(user);
                                                    directFriends = directFriends ? mapUsers(directFriends) : 0;
                                                    friendsOfFriends = friendsOfFriends ? mapUsers(friendsOfFriends) : 0;
                                                    res.status(200).json({
                                                        status: "ok",
                                                        user: user,
                                                        directFriends: directFriends,
                                                        friendsOfFriends: friendsOfFriends,
                                                        suggestedFriends: 0
                                                    });
                                                }
                                            }
                                        })
                                    }
                                } else {
                                    res.status(200).json({
                                        status: "ok",
                                        user: user,
                                        directFriends: directFriends,
                                        friendsOfFriends: 0,
                                        suggestedFriends: 0
                                    });
                                }
                            }
                        })
                    }
                } else {
                    res.status(200).json({
                        status: "ok",
                        user: user,
                        directFriends: 0,
                        friendsOfFriends: 0,
                        suggestedFriends: 0
                    });
                }
            }
        }
    })
});

//route for droping whole user table
router.get("/user/remove-all", function(req,res,next) {
    User.remove({}, function(err) {
        if (err) {
            next(err);
        } else {
            res.status(200).json({
                status: "ok",
                message: "You have successfully deleted all users"
            });
        }
    })
})

module.exports = router;