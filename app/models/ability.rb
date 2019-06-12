class Ability
  include CanCan::Ability
  prepend Draper::CanCanCan

  def initialize(user)
    user ||= Guest.new # guest user (not logged in)

    # Role specific abilities
    send(:"#{user.role}_can_abilities", user)
    send(:"#{user.role}_cannot_abilities", user)

    # Abilities that all users have
    user_can_abilities(user)

    # Abilities that everyone has (not just users)
    global_abilities
  end

private

  def admin_can_abilities(user)
    can :manage, User
  end

  def admin_cannot_abilities(user)
  end

  def business_can_abilities(user)
  end

  def business_cannot_abilities(user)
  end

  def global_abilities
    can :read, :all
  end

  def superadmin_can_abilities(user)
    can :manage, :all
  end

  def superadmin_cannot_abilities(user)
  end

  def user_can_abilities(user)
    can :update, user
  end
end
