const User = require('./dbModel');
const client = require('twilio')('AC5d6dabce4797b65a544edc775b8858bb', 'c0a502a6ef22603ce2c3d5cc18dba45f');

function addItem(req, res, next) {
    User.findOne({ number: req.body.From }, (err, user) => {
        if (err) { throw new Error(err) };
        if (!user) {
            User.create({ number: req.body.From, lists: { name: 'todo', items: [req.body.Body] } }, (err, created) => {
                client.messages.create({
                    to: req.body.From,
                    from: req.body.To,
                    body: `Item '${req.body.Body}' added to todo list`
                }, () => { return res.send(created); })
            })
        }
        else {
            let updatedList = { name: user.lists[0].name, items: user.lists[0].items.concat([req.body.Body]) };
            user.lists.splice(0, 1, updatedList);
            User.update({ number: req.body.From },
                { $set: { lists: user.lists } }, (err, success) =>
                    client.messages.create({
                        to: req.body.From,
                        from: req.body.To,
                        body: `Item '${req.body.Body}' added to ${user.lists[0].name} list`
                    }));
        }
    })
}

function newList(req, res, next) {
    User.findOne({ number: req.body.From }, (err, user) => {
        if (err) { throw new Error(err) };
        let i;
        for (i = 0; i < user.lists.length; i++) {
            if (user.lists[i].name.toLowerCase() == req.body.Body.split(/\s+/)[req.body.Body.split(/\s+/).length - 1].toLowerCase()) {
                break;
            }
        }
        if (i !== user.lists.length) {
            client.messages.create({
                to: req.body.From,
                from: req.body.To,
                body: `List '${req.body.Body.split(/\s+/)[req.body.Body.split(/\s+/).length - 1]}' already exists!`
            }, function (err, message) {
                return res.send("message sent");
            })
        }
        else {
            User.update({ number: req.body.From },
                {
                    $set:
                    {
                        lists: user.lists.concat([{ name: req.body.Body.split(/\s+/)[req.body.Body.split(/\s+/).length - 1], items: [] }])
                    }
                }, (err, created) => {
                    client.messages.create({
                        to: req.body.From,
                        from: req.body.To,
                        body: `List '${req.body.Body.split(/\s+/)[req.body.Body.split(/\s+/).length - 1]}' created`
                    }, function (err, message) {
                        return res.end();
                    })
                })
        }
    })
}

function oldListCheck(req, res, next) {
    //find the users file
    User.findOne({ number: req.body.From }, (err, user) => {
        if (err) { throw new Error(err) };
        //figure out if the user has a list with the specified name in it
        if (user) {
            let i;
            for (i = 0; i < user.lists.length; i++) {
                if (user.lists[i].name.toLowerCase() == req.body.Body.split(/\s+/)[req.body.Body.split(/\s+/).length - 1].toLowerCase()) {
                    break;
                }
            }
            //if the specified list name exists, update it with the new task
            if (i !== user.lists.length) {
                let updatedList = { name: user.lists[i].name, items: user.lists[i].items.concat([req.body.Body.split(/\s+/).slice(1, -2).join(" ")]) };
                user.lists.splice(i, 1, updatedList);
                User.update({ number: req.body.From }, { $set: { lists: user.lists } },
                    (err, created) => {
                        client.messages.create({
                            to: req.body.From,
                            from: req.body.To,
                            body: `Item '${[req.body.Body.split(/\s+/).slice(1, -2).join(" ")]}' added to ${user.lists[i].name} list`
                        }, (err, success) => { res.end() })
                    })
            }
            else {
                //if the list name doesn't exist, add the entire message body to todo
                let updatedList = { name: user.lists[0].name, items: user.lists[0].items.concat([req.body.Body]) };
                user.lists.splice(0, 1, updatedList);
                User.update({ number: req.body.From }, { $set: { lists: user.lists } }, (err, success) => {
                    res.body = JSON.stringify(success);
                    client.messages.create({
                        to: req.body.From,
                        from: req.body.To,
                        body: `Item '${req.body.Body}' added to ${user.lists[0].name} list`
                    }, (err, success) => { res.end() })
                });
            }
        }
        else{
            addItem(req,res,next);
        }
    });
}

function getLists(req, res, next) {
    //find the user's file
    User.findOne({ number: req.body.From }, (err, user) => {
        let messageArray = req.body.Body.split(/\s+/);
        var i;
        //if the user requests all
        if (messageArray[messageArray.length - 1] == 'all') {
            let listNames = [];
            for (i = 0; i < user.lists.length; i++) {
                listNames.push(user.lists[i].name);
            }
            client.messages.create({
                to: req.body.From,
                from: req.body.To,
                body: `Please get only 1 list. Your current lists include: ${listNames.join(", ")}`
            }, (err, success) => { return res.end() })
        }
        else {
            for (i = 0; i < user.lists.length; i++) {
                if (user.lists[i].name.toLowerCase() == messageArray[messageArray.length - 1].toLowerCase()) {
                    break;
                }
            }
            //if the list with the texted name exists
            if (i !== user.lists.length) {
                res.body = user.lists[i].items.join(", ")
                if (user.lists[i].items.length !== 0) {
                    client.messages.create({
                        to: req.body.From,
                        from: req.body.To,
                        body: `${user.lists[i].name}: ${user.lists[i].items.join(", ")}`
                    }, (err, success) => { res.end() })
                } else {
                    client.messages.create({
                        to: req.body.From,
                        from: req.body.To,
                        body: `${user.lists[i].name}: this list is currently empty`
                    }, (err, success) => { res.end() })
                }
            }
            // if the list with that name doesnt exist
            else {
                addItem(req, res, next)
            }
        }
    })
}

function removeItem(req, res, next) {
    User.findOne({ number: req.body.From }, (err, user) => {
        if (err) { throw new Error(err) };
        let messageItem = req.body.Body.split(/\s+/);
        //remove 'from <list name>' from message
        let messageList = messageItem.splice(-2, 2);
        //remove 'from' from messsage
        messageList.splice(0, 1);
        //remove 'remove' from message
        messageItem.splice(0, 1);
        var i;
        //check if list name is valid
        for (i = 0; i < user.lists.length; i++) {
            if (user.lists[i].name.toLowerCase() == messageList[0].toLowerCase()) {
                break;
            }
        }
        if (i !== user.lists.length) {
            //check if item name is valid
            let j;
            for (j = 0; j < user.lists[i].items.length; j++) {
                if (user.lists[i].items[j].toLowerCase() == messageItem.join(" ").toLowerCase()) {
                    break;
                }
            }
            if (j !== user.lists[i].items.length) {
                //remove item from list
                let updatedList = { name: user.lists[i].name, items: user.lists[i].items };
                let deletedItem = updatedList.items.splice(j, 1);
                user.lists.splice(i, 1, updatedList);
                User.update({ number: req.body.From }, { $set: { lists: user.lists } },
                    (err, created) => {
                        client.messages.create({
                            to: req.body.From,
                            from: req.body.To,
                            body: `Item '${deletedItem}' removed from ${user.lists[i].name} list`
                        }, (err, success) => { return res.end() })
                    })
            }
            else {
                //not a valid item
                client.messages.create({
                    to: req.body.From,
                    from: req.body.To,
                    body: `${user.lists[i].name} doesn't have a '${messageItem}' item`
                }, (err, success) => { res.end() })
            }
        }
        else {
            //not a table name
            addItem(req, res, next)
        }
    })
}

function removeList(req, res, next) {
    User.findOne({ number: req.body.From }, (err, user) => {
        if (err) { throw new Error(err) };
        let messageList = req.body.Body.split(/\s+/);
        //remove 'delete' from message
        messageList.splice(0, 1);
        var i;
        //check if list name is valid
        for (i = 0; i < user.lists.length; i++) {
            if (user.lists[i].name.toLowerCase() == messageList[0].toLowerCase()) {
                break;
            }
        }
        if (i !== user.lists.length) {
            //remove list from array of lists
            let deletedList = { name: user.lists[i].name, items: user.lists[i].items };
            if (i == 0)
                user.lists.splice(i, 1, { name: 'todo', items: [] });
            else
                user.lists.splice(i, 1)
            User.update({ number: req.body.From }, { $set: { lists: user.lists } },
                (err, created) => {
                    client.messages.create({
                        to: req.body.From,
                        from: req.body.To,
                        body: `Deleted list: '${deletedList.name}' with items: ${deletedList.items.join(", ")}`
                    }, (err, success) => { return res.end() })
                })
        }
        else {
            //not a valid List
            addItem(req, res, next)
        }
    })
}

const DBController = {
    ParseText(req, res, next) {
        let splitted = req.body.Body.toLowerCase().split(/\s+/);
        if (JSON.stringify(splitted.slice(0, 3)) === JSON.stringify(["create", "new", "list"])) {
            //create new list
            console.log('creating new list');
            newList(req, res, next);
        }
        else if (JSON.stringify(splitted.slice(0, 1)) === JSON.stringify(["get"]) && splitted.length === 2) {
            //have lists sent to you; get all or get <listName>
            console.log('entering get check')
            getLists(req, res, next)
        }
        else if (JSON.stringify(splitted.slice(0, 1)) === JSON.stringify(["delete"]) && splitted.length === 2) {
            console.log('entering removeList block')
            removeList(req, res, next)
        }
        else if (JSON.stringify(splitted.slice(0, 1)) === JSON.stringify(["delete"]) && JSON.stringify(splitted.slice(-2, -1)) === JSON.stringify(["from"])) {
            console.log('entering removeItem block')
            removeItem(req, res, next)
        }
        else if (JSON.stringify(splitted.slice(-2, -1)) === JSON.stringify(["to"])) {
            // add to specific list
            console.log('checking existing lists');
            oldListCheck(req, res, next)
        }
        else {
            //if they didn't include instructions, either create a default list or add to it
            console.log('adding to default');
            addItem(req, res, next);
        }
    },

    getList(req, res) {
        User.findOne(req.body, (err, user) => {
            if (err) { throw new Error(err) };
            console.log('we made the getList function')
            return res.send(user)
        })
    },
};

module.exports = DBController;