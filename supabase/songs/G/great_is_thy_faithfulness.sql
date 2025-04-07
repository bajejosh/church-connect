-- Great Is Thy Faithfulness (Public Domain)
-- SQL for inserting into songs table

INSERT INTO songs (
    church_id,
    title,
    artist,
    default_key,
    tempo,
    lyrics,
    chords,
    notes
)
SELECT 
    id AS church_id,
    'Great Is Thy Faithfulness' AS title,
    'Thomas O. Chisholm' AS artist,
    'D',
    68,
    E'[Verse 1]
Great is Thy faithfulness, O God my Father,
There is no shadow of turning with Thee;
Thou changest not, Thy compassions, they fail not;
As Thou hast been Thou forever wilt be.

[Chorus]
Great is Thy faithfulness! Great is Thy faithfulness!
Morning by morning new mercies I see;
All I have needed Thy hand hath provided—
Great is Thy faithfulness, Lord, unto me!

[Verse 2]
Summer and winter, and springtime and harvest,
Sun, moon and stars in their courses above,
Join with all nature in manifold witness
To Thy great faithfulness, mercy and love.

[Verse 3]
Pardon for sin and a peace that endureth,
Thine own dear presence to cheer and to guide;
Strength for today and bright hope for tomorrow,
Blessings all mine, with ten thousand beside!',
    E'[Verse]
D - G - D - A
D - G - A - D
G - D - E - A
D - G - A - D

[Chorus]
D - G - D
A - D - A
D - G - D - A
D - G - A - D',
    'Written by Thomas O. Chisholm in 1923, with music by William M. Runyan. The hymn is based on Lamentations 3:22-23: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness."' AS notes
FROM churches
LIMIT 1;
