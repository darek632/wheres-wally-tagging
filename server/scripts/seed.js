import "dotenv/config";
import {prisma} from "../db/prisma.js";

async function main() {


     await prisma.$executeRaw`TRUNCATE TABLE "Game","Character", "Image" RESTART IDENTITY CASCADE`;
    //clear before running every time to prevent duplicates

    // Prisma fills in imageId automatically, so there's no hard-coded 1.
  const image = await prisma.image.create({
    data: {
      name: "wally-olympics",
      url: "/full-images/whereswally1.jpg",
      characters: {
        create: [
          // y is a fraction from the top border (0 = top, 1 = bottom),
          // so yMin is the top edge of the box and yMax the bottom edge.
          { name: "Wally",  xMin: 0.2436, xMax: 0.2566, yMin: 0.7155, yMax: 0.7423 },
          { name: "Odlaw",  xMin: 0.5898, xMax: 0.6051, yMin: 0.6351, yMax: 0.6652 },
          { name: "Wizard", xMin: 0.6051, xMax: 0.6176, yMin: 0.8513, yMax: 0.9174 },
        ],
      },
    },
  });

  const count = await prisma.character.count();
 console.log(`Seeded image "${image.name}" (id ${image.id} with ${count} characters)`);


}


main()
.catch((err)=> {
    console.error(err);
    process.exitCode = 1;
})
.finally(()=> prisma.$disconnect());

// prisma.image.create({data: 
//     {
//         name: "wally-olympics",
//         url: "/full-images/whereswally1.jpg"
//     }
// })

// prisma.character.create({
//     data: {
//         name: "Wally",
//         xMin: 0.2436,
//         xMax: 0.2566,
//         yMin: 0.7155, // top of the box, as y counted as fraction from top border so at top is 0 and bottom border is 1
//         yMax: 0.7423,
//         imageId: 1,
//     }
// })

// // // bottom left: 

// // {x: 0.2435551016645036, y: 0.7422015954247847 } 

// // // top right:

// // {x: 0.2566455496390462, y: 0.715525273047695}


// prisma.character.create({
//     data: {
//         name: "Odlaw",
//         xMin: 0.5898,
//         xMax: 0.6051,
//         yMin: 0.6351,
//         yMax: 0.6652,
//         imageId: 1,
//     }
// })

// // bottom left: 

// //  Odlaw {x: 0.5898034923775247, y: 0.6652373522511702}

// // top right:

// // Odlaw {x: 0.6050694897536815, y: 0.6350645997732554}




// prisma.character.create({
//     data: {
//         name: "Wizard",
//         xMin: 0.6051,
//         xMax: 0.6176,
//         yMin: 0.8513,
//         yMax: 0.9174,
//         imageId: 1,
//     }
// })

// // // bottom left: 

// // Wizard Whitebeard {x: 0.6050694897536815, y: 0.9173953551023157}

// // // top right

// // Wizard Whitebeard {x: 0.6176414875928693, y: 0.8513026591983117}





