-- Trust and Obey (Public Domain)
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
    'Trust and Obey' AS title,
    'John H. Sammis' AS artist,
    'D' AS default_key,
    88 AS tempo,
    E'[Verse 1]
When we walk with the Lord in the light of His Word,
What a glory He sheds on our way!
While we do His good will, He abides with us still,
And with all who will trust and obey.

[Chorus]
Trust and obey, for there''s no other way
To be happy in Jesus, but to trust and obey.

[Verse 2]
Not a shadow can rise, not a cloud in the skies,
But His smile quickly drives it away;
Not a doubt or a fear, not a sigh or a tear,
Can abide while we trust and obey.

[Verse 3]
Not a burden we bear, not a sorrow we share,
But our toil He doth richly repay;
Not a grief or a loss, not a frown or a cross,
But is blessed if we trust and obey.

[Verse 4]
But we never can prove the delights of His love
Until all on the altar we lay;
For the favor He shows, for the joy He bestows,
Are for them who will trust and obey.',
    E'[Verse]
D - A - D
G - D - A - D
D - A - D
G - D - A - D

[Chorus]
D - A - D
G - D - A - D',
    'Written by Presbyterian minister John H. Sammis in 1887. The hymn was inspired by a young man''s testimony at a Dwight L. Moody evangelistic meeting, where he said: "I am not quite sure—but I am going to trust, and I am going to obey."' AS notes
FROM churches
LIMIT 1;
