-- This script will combine all song SQL files for easy execution
-- Run this in the Supabase SQL Editor to add all songs at once

-- First, let's create a helper function to aid in song insertion
CREATE OR REPLACE FUNCTION insert_song_if_not_exists(
    p_title TEXT,
    p_artist TEXT,
    p_default_key TEXT,
    p_tempo INTEGER,
    p_lyrics TEXT,
    p_chords TEXT,
    p_notes TEXT
) RETURNS VOID AS $$
DECLARE
    church_id_var UUID;
    song_exists BOOLEAN;
BEGIN
    -- Get the first church_id from the database
    SELECT id INTO church_id_var FROM churches LIMIT 1;
    
    -- If no church exists, raise an error and exit
    IF church_id_var IS NULL THEN
        RAISE EXCEPTION 'No churches found in the database. Please create a church first.';
        RETURN;
    END IF;
    
    -- Check if song already exists
    SELECT EXISTS (
        SELECT 1 FROM songs WHERE title = p_title AND artist = p_artist
    ) INTO song_exists;
    
    -- Only insert if the song doesn't already exist
    IF NOT song_exists THEN
        INSERT INTO songs (
            church_id, 
            title, 
            artist, 
            default_key, 
            tempo, 
            lyrics, 
            chords, 
            notes
        ) VALUES (
            church_id_var,
            p_title,
            p_artist,
            p_default_key,
            p_tempo,
            p_lyrics,
            p_chords,
            p_notes
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Now call the function for each song

-- Amazing Grace
SELECT insert_song_if_not_exists(
    'Amazing Grace',
    'John Newton',
    'G',
    72,
    E'[Verse 1]
Amazing grace! how sweet the sound,
That saved a wretch like me!
I once was lost, but now am found,
Was blind, but now I see.

[Verse 2]
''Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear
The hour I first believed!

[Verse 3]
Through many dangers, toils, and snares,
I have already come;
''Tis grace hath brought me safe thus far,
And grace will lead me home.

[Verse 4]
The Lord has promised good to me,
His Word my hope secures;
He will my Shield and Portion be,
As long as life endures.',
    E'[Verse]
G - G7 - C - G
Em - D - G - D
G - G7 - C - G
Em - D - G

[Verse 2]
G - G7 - C - G
Em - D - G - D
G - G7 - C - G
Em - D - G',
    'This classic hymn was written by John Newton, a former slave trader who experienced a profound conversion to Christianity.'
);

-- The Old Rugged Cross
SELECT insert_song_if_not_exists(
    'The Old Rugged Cross',
    'George Bennard',
    'A',
    76,
    E'[Verse 1]
On a hill far away stood an old rugged cross,
the emblem of suffering and shame;
and I love that old cross where the dearest and best
for a world of lost sinners was slain.

[Chorus]
So I''ll cherish the old rugged cross,
till my trophies at last I lay down;
I will cling to the old rugged cross,
and exchange it some day for a crown.

[Verse 2]
O that old rugged cross, so despised by the world,
has a wondrous attraction for me;
for the dear Lamb of God left his glory above
to bear it to dark Calvary.

[Verse 3]
In that old rugged cross, stained with blood so divine,
a wondrous beauty I see,
for ''twas on that old cross Jesus suffered and died,
to pardon and sanctify me.

[Verse 4]
To the old rugged cross I will ever be true,
its shame and reproach gladly bear;
then he''ll call me some day to my home far away,
where his glory forever I''ll share.',
    E'[Verse]
A - A7 - D - B7
E - E7 - A - A7

[Chorus]
E - E7 - A - A7
D - D7 - A - A7
A - A7 - D - D7
A - E - A',
    'Written by George Bennard in 1912-1913, this hymn speaks of the writer''s Christian experience and adoration of Christ and His sacrifice on the cross.'
);

-- Blessed Assurance
SELECT insert_song_if_not_exists(
    'Blessed Assurance',
    'Fanny Crosby',
    'D',
    76,
    E'[Verse 1]
Blessed assurance, Jesus is mine!
Oh, what a foretaste of glory divine!
Heir of salvation, purchase of God,
Born of His Spirit, washed in His blood.

[Chorus]
This is my story, this is my song,
Praising my Savior all the day long;
This is my story, this is my song,
Praising my Savior all the day long.

[Verse 2]
Perfect submission, perfect delight,
Visions of rapture now burst on my sight;
Angels, descending, bring from above
Echoes of mercy, whispers of love.

[Verse 3]
Perfect submission, all is at rest,
I in my Savior am happy and blest;
Watching and waiting, looking above,
Filled with His goodness, lost in His love.',
    E'[Verse]
D - A7 - D
G - D - E - A
D - A7 - D
G - D - A - D

[Chorus]
D - A7 - D
G - D - A - D
D - A7 - D
G - D - A - D',
    'Written by Fanny Crosby in 1873, with music by Phoebe Knapp. This hymn expresses the joy and confidence of the Christian who is assured of salvation in Christ.'
);

-- How Great Thou Art
SELECT insert_song_if_not_exists(
    'How Great Thou Art',
    'Stuart K. Hine',
    'A',
    72,
    E'[Verse 1]
O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made,
I see the stars, I hear the rolling thunder,
Thy pow''r throughout the universe displayed.

[Chorus]
Then sings my soul, my Savior God, to Thee:
How great Thou art, how great Thou art!
Then sings my soul, my Savior God, to Thee:
How great Thou art, how great Thou art!

[Verse 2]
When through the woods and forest glades I wander
And hear the birds sing sweetly in the trees,
When I look down from lofty mountain grandeur,
And hear the brook and feel the gentle breeze.

[Verse 3]
And when I think that God, His Son not sparing,
Sent Him to die, I scarce can take it in,
That on the cross, my burden gladly bearing,
He bled and died to take away my sin.

[Verse 4]
When Christ shall come with shout of acclamation
And take me home, what joy shall fill my heart!
Then I shall bow in humble adoration,
And there proclaim, my God, how great Thou art!',
    E'[Verse]
A - E - A
A - D - A - E
A - E - A
A - E - A

[Chorus]
A - D - A
E - A - E
A - D - A
E - A',
    'Originally a Swedish poem "O Store Gud" written by Carl Gustav Boberg in 1885. Translated into English by Stuart K. Hine in 1949. This hymn reflects on God''s majesty seen in nature and His sacrifice on the cross.'
);

-- Great Is Thy Faithfulness
SELECT insert_song_if_not_exists(
    'Great Is Thy Faithfulness',
    'Thomas O. Chisholm',
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
    'Written by Thomas O. Chisholm in 1923, with music by William M. Runyan. The hymn is based on Lamentations 3:22-23: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness."'
);

-- Come Thou Fount
SELECT insert_song_if_not_exists(
    'Come Thou Fount of Every Blessing',
    'Robert Robinson',
    'G',
    86,
    E'[Verse 1]
Come, Thou Fount of every blessing,
Tune my heart to sing Thy grace;
Streams of mercy, never ceasing,
Call for songs of loudest praise.
Teach me some melodious sonnet,
Sung by flaming tongues above.
Praise the mount, I''m fixed upon it,
Mount of Thy redeeming love.

[Verse 2]
Here I raise my Ebenezer;
Here by Thy great help I''ve come;
And I hope, by Thy good pleasure,
Safely to arrive at home.
Jesus sought me when a stranger,
Wandering from the fold of God;
He, to rescue me from danger,
Interposed His precious blood.

[Verse 3]
O to grace how great a debtor
Daily I''m constrained to be!
Let Thy goodness, like a fetter,
Bind my wandering heart to Thee.
Prone to wander, Lord, I feel it,
Prone to leave the God I love;
Here''s my heart, O take and seal it,
Seal it for Thy courts above.',
    E'[Verse]
G - C - G - D
G - C - G - D
G - C - G - D
G - C - D - G

[Verse 2]
G - C - G - D
G - C - G - D
G - C - G - D
G - C - D - G',
    'Written in 1758 by Robert Robinson when he was just 22 years old. The term "Ebenezer" refers to a stone of remembrance from 1 Samuel 7:12.'
);

-- Holy, Holy, Holy
SELECT insert_song_if_not_exists(
    'Holy, Holy, Holy',
    'Reginald Heber',
    'D',
    80,
    E'[Verse 1]
Holy, holy, holy! Lord God Almighty!
Early in the morning our song shall rise to Thee;
Holy, holy, holy! Merciful and mighty!
God in three Persons, blessed Trinity!

[Verse 2]
Holy, holy, holy! All the saints adore Thee,
Casting down their golden crowns around the glassy sea;
Cherubim and seraphim falling down before Thee,
Who wert and art and evermore shalt be.

[Verse 3]
Holy, holy, holy! Though the darkness hide Thee,
Though the eye of sinful man Thy glory may not see;
Only Thou art holy; there is none beside Thee,
Perfect in pow''r, in love, and purity.

[Verse 4]
Holy, holy, holy! Lord God Almighty!
All Thy works shall praise Thy name in earth and sky and sea;
Holy, holy, holy! Merciful and mighty!
God in three Persons, blessed Trinity!',
    E'[Verse]
D - A - D
G - D - A - D
D - A - D
G - D - A - D',
    'Written by Reginald Heber in 1826, this hymn is based on Revelation 4:8-11 which describes the four living creatures around God''s throne who continually declare "Holy, holy, holy is the Lord God Almighty, who was, and is, and is to come."'
);

-- It Is Well With My Soul
SELECT insert_song_if_not_exists(
    'It Is Well With My Soul',
    'Horatio G. Spafford',
    'Eb',
    63,
    E'[Verse 1]
When peace like a river attendeth my way,
When sorrows like sea billows roll;
Whatever my lot, Thou hast taught me to say,
"It is well, it is well with my soul."

[Chorus]
It is well with my soul,
It is well, it is well with my soul.

[Verse 2]
Though Satan should buffet, though trials should come,
Let this blest assurance control,
That Christ has regarded my helpless estate,
And has shed His own blood for my soul.

[Verse 3]
My sin—oh, the bliss of this glorious thought—
My sin, not in part, but the whole,
Is nailed to the cross, and I bear it no more,
Praise the Lord, praise the Lord, O my soul!

[Verse 4]
And, Lord, haste the day when the faith shall be sight,
The clouds be rolled back as a scroll,
The trump shall resound and the Lord shall descend,
"Even so"—it is well with my soul.',
    E'[Verse]
Eb - Bb - Eb - Bb
Eb - Bb - Eb
Ab - Eb - Bb - Eb
Cm - Bb - Eb

[Chorus]
Ab - Eb - Bb
Eb - Bb - Eb',
    'Written by Horatio G. Spafford in 1873 following several traumatic events in his life, including the loss of his four daughters in a shipwreck. The hymn speaks to the peace that comes from faith in God despite circumstances.'
);

-- What a Friend We Have in Jesus
SELECT insert_song_if_not_exists(
    'What a Friend We Have in Jesus',
    'Joseph M. Scriven',
    'F',
    76,
    E'[Verse 1]
What a friend we have in Jesus,
All our sins and griefs to bear!
What a privilege to carry
Everything to God in prayer!
Oh, what peace we often forfeit,
Oh, what needless pain we bear,
All because we do not carry
Everything to God in prayer!

[Verse 2]
Have we trials and temptations?
Is there trouble anywhere?
We should never be discouraged—
Take it to the Lord in prayer.
Can we find a friend so faithful,
Who will all our sorrows share?
Jesus knows our every weakness;
Take it to the Lord in prayer.

[Verse 3]
Are we weak and heavy-laden,
Cumbered with a load of care?
Precious Savior, still our refuge—
Take it to the Lord in prayer.
Do thy friends despise, forsake thee?
Take it to the Lord in prayer!
In His arms He''ll take and shield thee,
Thou wilt find a solace there.',
    E'[Verse]
F - C7 - F
Bb - F - C - F
F - C7 - F
Bb - F - C - F',
    'Written by Joseph M. Scriven in 1855 as a poem to comfort his mother who was living in Ireland while he was in Canada. It was not originally intended to be a hymn, but was later set to music by Charles C. Converse in 1868.'
);

-- Nearer, My God, to Thee
SELECT insert_song_if_not_exists(
    'Nearer, My God, to Thee',
    'Sarah Flower Adams',
    'Eb',
    70,
    E'[Verse 1]
Nearer, my God, to Thee, nearer to Thee!
E''en though it be a cross that raiseth me,
Still all my song shall be, nearer, my God, to Thee.
Nearer, my God, to Thee, nearer to Thee!

[Verse 2]
Though like the wanderer, the sun gone down,
Darkness be over me, my rest a stone.
Yet in my dreams I''d be nearer, my God to Thee.
Nearer, my God, to Thee, nearer to Thee!

[Verse 3]
There let the way appear, steps unto Heav''n;
All that Thou sendest me, in mercy giv''n;
Angels to beckon me nearer, my God, to Thee.
Nearer, my God, to Thee, nearer to Thee!

[Verse 4]
Then, with my waking thoughts bright with Thy praise,
Out of my stony griefs Bethel I''ll raise;
So by my woes to be nearer, my God, to Thee.
Nearer, my God, to Thee, nearer to Thee!',
    E'[Verse]
Eb - Bb - Eb
Ab - Eb - Bb - Eb
Eb - Bb - Eb - Ab - Eb - Bb
Eb - Bb - Eb',
    'Written by Sarah Flower Adams in 1841. The hymn is loosely based on Jacob''s dream in Genesis 28:11-19, where he sees a ladder extending from earth to heaven. It was famously played by the band on the RMS Titanic as it sank in 1912.'
);

-- Drop the helper function at the end
DROP FUNCTION IF EXISTS insert_song_if_not_exists;
