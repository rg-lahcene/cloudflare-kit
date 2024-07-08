import { PUBLIC_CLOUDINARY_IMAGE_SRC } from '$env/static/public';

export function getExternalImageUrl(
	image: string,
	transformations: string = 'c_fit,w_300'
): string {
	if (!image) {
		// TODO return placeholder may be?
		return '';
	}

	const cloudinaryFolders = ['exerciseimages', 'userimages', 'userassets', 'uservideos'];
	const fullDomainChecks = ['http://', 'https://'];
	const extension = 'png';

	// Not sure this is the most robust way to do this but for now..
	// Once these are duplicated across region we will only use the filename, so it will just
	// be the simple check above for a UUID.
	if (typeof image === 'string' && image.includes('amazonaws.com')) {
		return image.replace('upload/', `medium/`);
	}
	if (!cloudinaryFolders.some((el) => image.includes(el))) {
		// This is an image that is not from a remote source so we return it as a local one as
		// the user is probably on the exercise creation screen.
		return image;
	}
	// some URLs might be full qualified ones from Cloudinary, which
	// would pass the above test. However, we'll just check if they contain
	// http and return it as is
	if (fullDomainChecks.some((el) => image.includes(el))) {
		return image;
	}
	const imageVideoTransformation = image.includes('uservideos') ? 'w_300,h_300' : transformations;

	return `${PUBLIC_CLOUDINARY_IMAGE_SRC}/${imageVideoTransformation}/${image}.${extension}`;
}
