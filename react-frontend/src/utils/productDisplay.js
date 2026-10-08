function stripLanguagePrefix(value) {
    return String(value || "")
        .trim()
        .replace(
            /^[a-z]{2,3}:/i,
            ""
        );
}


function cleanSpacing(value) {
    return String(value || "")
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


function titleCase(value) {
    return value
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}


export function formatProductCategory(
    category
) {
    if (!category) {
        return "Uncategorized";
    }


    const rawCategory =
        String(category).trim();


    const searchable =
        rawCategory
            .toLowerCase()
            .replace(
                /[_-]+/g,
                " "
            );



    if (
        searchable.includes(
            "instant oats"
        ) ||
        searchable.includes(
            "flocons d'avoine"
        ) ||
        searchable.includes(
            "flocons d’avoine"
        )
    ) {
        return "Instant Oats";
    }


    if (
        searchable.includes(
            "cola"
        )
    ) {
        return "Cola Beverages";
    }


    if (
        searchable.includes(
            "confectionary based spreads"
        ) ||
        searchable.includes(
            "confectionery based spreads"
        )
    ) {
        return "Confectionery Spreads";
    }


    const categories =
        rawCategory
            .split(",")
            .map(
                (item) =>
                    item.trim()
            )
            .filter(Boolean);



    const englishCategory =
        categories.find(
            (item) =>
                /^en:/i.test(
                    item
                )
        );


    const selectedCategory =
        englishCategory ||
        categories[0] ||
        rawCategory;


    const cleaned =
        cleanSpacing(
            stripLanguagePrefix(
                selectedCategory
            )
        );


    if (!cleaned) {
        return "Uncategorized";
    }


    return titleCase(
        cleaned
    );
}


export function formatProductBrand(
    brand
) {
    if (!brand) {
        return "No Brand";
    }


    const brands =
        String(brand)
            .split(",")
            .map(
                (item) =>
                    item.trim()
            )
            .filter(Boolean);


    if (
        brands.length === 0
    ) {
        return "No Brand";
    }


    if (
        brands.length === 1
    ) {
        return brands[0];
    }



    return brands.reduce(
        (
            best,
            current
        ) => {
            if (
                current.length <
                best.length
            ) {
                return current;
            }

            return best;
        },
        brands[0]
    );
}