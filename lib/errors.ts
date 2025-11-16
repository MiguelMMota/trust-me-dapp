/**
 * Utility functions for handling transaction errors
 */

/**
 * Converts a blockchain transaction error into a user-friendly message
 * @param error - The error object from a transaction
 * @returns A user-friendly error message string
 */
export function getTransactionErrorMessage(error: Error | null): string {
  if (!error) return '';

  const errorMessage = error.message.toLowerCase();

  // User rejected the transaction
  if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
    return 'Transaction was rejected. Please try again.';
  }

  // Insufficient funds
  if (errorMessage.includes('insufficient funds')) {
    return 'Insufficient funds to complete this transaction.';
  }

  // Gas estimation failed
  if (errorMessage.includes('gas')) {
    return 'Transaction failed due to gas estimation error. The transaction may revert.';
  }

  // Network error
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Contract revert or execution error
  if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
    return 'Transaction failed. The contract rejected this operation.';
  }

  // Generic error
  return 'Transaction failed. Please try again.';
}

/**
 * Error messages specific to feedback/rating transactions
 */
export function getRatingErrorMessage(error: Error | null): string {
  if (!error) return '';

  const errorMessage = error.message.toLowerCase();

  // Contract revert - likely already rated
  if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
    return 'Transaction failed. You may have already rated this user on this topic.';
  }

  // Fall back to generic transaction error
  return getTransactionErrorMessage(error);
}

/**
 * Error messages specific to poll voting transactions
 */
export function getPollVoteErrorMessage(error: Error | null): string {
  if (!error) return '';

  const errorMessage = error.message.toLowerCase();

  // Contract revert - likely already voted or poll closed
  if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
    return 'Transaction failed. You may have already voted or the poll may be closed.';
  }

  // Fall back to generic transaction error
  return getTransactionErrorMessage(error);
}

/**
 * Error messages specific to challenge attempt transactions
 */
export function getChallengeAttemptErrorMessage(error: Error | null): string {
  if (!error) return '';

  const errorMessage = error.message.toLowerCase();

  // Contract revert - likely already attempted or invalid answer
  if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
    return 'Transaction failed. You may have already attempted this challenge or provided an invalid answer.';
  }

  // Fall back to generic transaction error
  return getTransactionErrorMessage(error);
}

/**
 * Error messages specific to user registration transactions
 */
export function getRegistrationErrorMessage(error: Error | null): string {
  if (!error) return '';

  const errorMessage = error.message.toLowerCase();

  // Contract revert - likely already registered
  if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
    return 'Transaction failed. You may already be registered.';
  }

  // Fall back to generic transaction error
  return getTransactionErrorMessage(error);
}

/**
 * Error messages specific to team operations
 */
export function getTeamErrorMessage(error: Error | null): string {
  if (!error) return '';

  const errorMessage = error.message.toLowerCase();

  // Contract revert - various team-related errors
  if (errorMessage.includes('invalidteamname')) {
    return 'Invalid team name. Please use a valid name (1-50 characters).';
  }

  if (errorMessage.includes('teamalreadyexists')) {
    return 'A team with this name already exists.';
  }

  if (errorMessage.includes('teamdoesnotexist')) {
    return 'This team does not exist.';
  }

  if (errorMessage.includes('notteamowner')) {
    return 'You must be the team owner to perform this action.';
  }

  if (errorMessage.includes('notteamadmin')) {
    return 'You must be a team admin to perform this action.';
  }

  if (errorMessage.includes('notteammember')) {
    return 'You are not a member of this team.';
  }

  if (errorMessage.includes('useralreadymember')) {
    return 'This user is already a member of the team.';
  }

  if (errorMessage.includes('usernotmember')) {
    return 'This user is not a member of the team.';
  }

  if (errorMessage.includes('cannotremoveowner')) {
    return 'The team owner cannot be removed.';
  }

  if (errorMessage.includes('cannotremoveself')) {
    return 'You cannot remove yourself from the team.';
  }

  if (errorMessage.includes('teaminactive')) {
    return 'This team is inactive.';
  }

  if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
    return 'Transaction failed. Please check the operation and try again.';
  }

  // Fall back to generic transaction error
  return getTransactionErrorMessage(error);
}
