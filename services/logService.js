exports.log = async (client, args) => {
    const user = await client.users.fetch('834334640286072862', false);
    await user.send(args)
}