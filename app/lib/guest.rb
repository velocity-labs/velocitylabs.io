#
# NullObject pattern to give us a Guest user.
#
# Guests should mimic methods of a user and return sensible null or empty values.
#
class Guest

## Array methods - empty
  [].each do |m|
    define_method m do |*_|
      []
    end
  end

## Nil methods
  [
    :email
  ].each do |m|
    define_method m do |*_|
      nil
    end
  end

## Boolean methods - false
  [].each do |m|
    define_method m do |*_|
      false
    end
  end

## Boolean methods - true
  [].each do |m|
    define_method m do |*_|
      true
    end
  end

## Other methods
  def name
    'Guest User'
  end

  def id
    -1
  end
end
