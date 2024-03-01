package mutationtesting

import io.circe.{Codec, Decoder, Encoder}

protected[mutationtesting] object CodecOps {
  implicit class CodecMapOps[A](codec: Codec[A]) {

    /** Create a new Codec by mapping both the Decoder and Encoder to a new type with the given functions and combining
      * them
      */
    def mapCodec[B](f: Decoder[A] => Decoder[B])(g: Encoder[A] => Encoder[B]) =
      Codec.from(f(codec), g(codec))

    /** Map the Decoder inside this Codec and return a new Codec with the given function applied
      */
    def mapDecoder(f: Decoder[A] => Decoder[A]): Codec[A] =
      mapCodec(f)(identity)

    /** Map the Encoder inside this Codec and return a new Codec with the given function applied
      */
    def mapEncoder(f: Encoder[A] => Encoder[A]): Codec[A] =
      mapCodec(identity)(f)

  }
}
