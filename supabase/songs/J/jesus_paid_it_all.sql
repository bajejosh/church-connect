-- Jesus Paid It All (Public Domain)
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
    'Jesus Paid It All' AS title,
    'Elvina M. Hall' AS artist,
    'G' AS default_key,
    72 AS tempo,
    E'[Verse 1]
I hear the Savior say,
"Thy strength indeed is small,
Child of weakness, watch and pray,
Find in Me thine all in all."

[Chorus]
Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain,
He washed it white as snow.

[Verse 2]
Lord, now indeed I find
Thy power, and Thine alone,
Can change the leper''s spots,
And melt the heart of stone.

[Verse 3]
For nothing good have I
Whereby Thy grace to claim;
I''ll wash my garments white
In the blood of Calvary''s Lamb.

[Verse 4]
And when, before the throne,
I stand in Him complete,
"Jesus died my soul to save,"
My lips shall still repeat.',
    E'[Verse]
G - D - G - C
G - D - G
G - D - G - C
G - D - G

[Chorus]
C - G - D
C - D - G
G - D - G - C
G - D - G',
    'Written by Elvina M. Hall in 1865, the hymn emphasizes the complete atonement made by Christ for sin. Hall is reported to have composed the lyrics during a Sunday service while sitting in the choir loft, writing them on the flyleaf of her hymnal.' AS notes
FROM churches
LIMIT 1;
