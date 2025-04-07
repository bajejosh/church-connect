-- Sweet Hour of Prayer (Public Domain)
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
    'Sweet Hour of Prayer' AS title,
    'William W. Walford' AS artist,
    'D' AS default_key,
    68 AS tempo,
    E'[Verse 1]
Sweet hour of prayer! sweet hour of prayer!
That calls me from a world of care,
And bids me at my Father''s throne
Make all my wants and wishes known.
In seasons of distress and grief,
My soul has often found relief,
And oft escaped the tempter''s snare,
By thy return, sweet hour of prayer!

[Verse 2]
Sweet hour of prayer! sweet hour of prayer!
The joys I feel, the bliss I share,
Of those whose anxious spirits burn
With strong desires for thy return!
With such I hasten to the place
Where God my Savior shows His face,
And gladly take my station there,
And wait for thee, sweet hour of prayer!

[Verse 3]
Sweet hour of prayer! sweet hour of prayer!
Thy wings shall my petition bear
To Him whose truth and faithfulness
Engage the waiting soul to bless.
And since He bids me seek His face,
Believe His Word and trust His grace,
I''ll cast on Him my every care,
And wait for thee, sweet hour of prayer!',
    E'[Verse]
D - A - D
G - D - A
D - A - D
G - D - A
D - A - D
G - D - A
D - A - D
G - D - A - D',
    'Written by William W. Walford in the 1840s. Walford was a blind preacher from England. He composed the lyrics and recited them to his friend, Thomas Salmon, who had the words published in the New York Observer in 1845. William B. Bradbury later set the poem to music in 1861.' AS notes
FROM churches
LIMIT 1;
