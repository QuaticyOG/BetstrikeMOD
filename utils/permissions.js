async function ensureMemberHasPermission(interaction, permission) {
  if (!interaction.memberPermissions?.has(permission)) {
    await interaction.reply({
      content: `You need the \`${permission}\` permission to use this command.`,
      ephemeral: true
    });
    return false;
  }
  return true;
}

module.exports = { ensureMemberHasPermission };
