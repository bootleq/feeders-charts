add
| group_by(.year, .city)
| map({
  year: .[0].year,
  city: .[0].city,
} + (reduce .[] as $item ({}; . + $item)))
